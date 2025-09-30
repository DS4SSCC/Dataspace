import type { Service } from "@sourceregistry/svelte-service-manager";
import { prisma } from "$lib/server/configurations/prisma.config";
import { env } from "$env/dynamic/private";

// OPA server URL (e.g., "http://localhost:8181")
const OPA_URL = env.OPA_SERVER_URL || "http://localhost:8181";

// Utility to make requests to OPA
async function opaRequest(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = `${OPA_URL}${path}`;
    const res = await fetch(url, {
        headers: {
            "Content-Type": "text/plain",
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OPA request failed (${res.status}): ${errorText}`);
    }

    return res;
}

const OpenPolicyEngine = {
    version: "1.0",
    policies: {
        async list() {
            const res = await opaRequest("/v1/policies");
            return (await res.json()) as { result: { id: string }[] };
        },
        async get(id: string) {
            const res = await opaRequest(`/v1/policies/${encodeURIComponent(id)}`);
            return (await res.json()) as { result: { id: string; raw: string } };
        },
        async put(id: string, raw: string) {
            await opaRequest(`/v1/policies/${encodeURIComponent(id)}`, {
                method: "PUT",
                body: raw,
            });
        },
        async delete(id: string) {
            await opaRequest(`/v1/policies/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
        },
    },
    data: {
        async set(path: string, value: unknown) {
            await opaRequest(`/v1/data/${path}`, {
                method: "PUT",
                body: JSON.stringify(value),
                headers: { "Content-Type": "application/json" },
            });
        },
        async get(path: string) {
            const res = await opaRequest(`/v1/data/${path}`);
            return await res.json();
        },
    },
    query: {
        async evaluate(input: unknown, path = "data") {
            const res = await opaRequest(`/v1/${path}`, {
                method: "POST",
                body: JSON.stringify({ input }),
                headers: { "Content-Type": "application/json" },
            });
            return await res.json();
        },
    },
    compile: {
        async compile(query: string) {
            const res = await opaRequest("/v1/compile", {
                method: "POST",
                body: JSON.stringify({ query }),
                headers: { "Content-Type": "application/json" },
            });
            return await res.json();
        },
    },
    health: {
        async check() {
            const res = await fetch(`${OPA_URL}/health?plugins`);
            return res.ok;
        },
    },
    config: {
        url: OPA_URL,
    },
    status: {
        async get() {
            const res = await fetch(`${OPA_URL}/status`);
            return res.ok ? await res.json() : null;
        },
    },
};

const service = {
    name: "policy",
    async load() {
        // Test connection to OPA
        if (!(await OpenPolicyEngine.health.check())) {
            throw new Error("OPA server is not reachable");
        }

        // Clear all policies from OPA
        const { result: policies } = await OpenPolicyEngine.policies.list();
        for (const policy of policies) {
            await OpenPolicyEngine.policies.delete(policy.id);
        }

        // Load active policies from DB
        const dbPolicies = await prisma.policy.findMany({
            where: { active: true },
        });

        for (const p of dbPolicies) {
            await OpenPolicyEngine.policies.put(p.id, p.raw);
        }
    },
    local: {
        async reload() {
            // Reuse the same logic as load()
            await service.load();
        },
        async create(input: { name: string; description?: string; raw: string; active?: boolean }) {
            const { id } = await prisma.policy.create({
                data: {
                    name: input.name,
                    description: input.description,
                    raw: input.raw,
                    active: input.active ?? true,
                },
            });

            // If active, load into OPA
            if (input.active !== false) {
                await OpenPolicyEngine.policies.put(id, input.raw);
            }

            return { id };
        },
        async deactivate(policy: { id: string }) {
            await prisma.policy.update({
                where: { id: policy.id },
                data: { active: false },
            });

            // Remove from OPA
            try {
                await OpenPolicyEngine.policies.delete(policy.id);
            } catch (error) {
                // Policy might not exist in OPA (e.g., was already deleted), so ignore 404
                if ((error as Error).message.includes("404")) {
                    console.warn(`Policy ${policy.id} not found in OPA during deactivation`);
                } else {
                    throw error;
                }
            }
        },
    },
} satisfies Service<"policy">;

export type PolicyService = typeof service;

export default service;
