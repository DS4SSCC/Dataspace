import {type Service, ServiceManager} from "@sourceregistry/svelte-service-manager";
import {prisma} from "$lib/server/configurations/prisma.config";
import {OPAClient} from "@sourceregistry/node-opa";

const client = new OPAClient();

const service = {
    name: "policy",
    async load() {
        // Test connection to OPA
        if (!(await client.health.check().catch(() => false))) {
            throw new Error("OPA server is not reachable");
        }

        // Clear all policies from OPA
        const {result: policies} = await client.policy.list();
        for (const policy of policies) {
            await client.policy.delete(policy.id);
        }

        // Load active policies from DB
        const dbPolicies = await prisma.policy.findMany({
            where: {active: true},
        });

        for (const p of dbPolicies) {
            await client.policy.put(p.id, p.raw);
        }
    },
    local: {
        async create(input: { name: string; description?: string; raw: string; active?: boolean }) {
            const {id} = await prisma.policy.create({
                data: {
                    name: input.name,
                    description: input.description,
                    raw: input.raw,
                    active: input.active ?? true,
                },
            });

            // If active, load into OPA
            if (input.active) {
                await client.policy.put(id, input.raw);
            }

            return {id};
        },
        async deactivate(policy: { id: string }) {
            await prisma.policy.update({
                where: {id: policy.id},
                data: {active: false},
            });

            // Remove from OPA
            try {
                await client.policy.delete(policy.id);
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

ServiceManager.Load(service, import.meta).finally(() => console.log(`[Service][${service.name}] Loaded`))
