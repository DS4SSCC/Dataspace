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
        for (const policy of policies) await client.policy.delete(policy.id);

        // Load active policies from DB
        const dbPolicies = await prisma.policy.findMany({
            where: {active: true},
        });

        for (const p of dbPolicies) await client.policy.put(p.package, p.raw);
    },
    local: {
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
        async load(policy: { id: string }) {
            const _policy = await prisma.policy.findUniqueOrThrow({where: {id: policy.id}}).catch(() => undefined);
            if (!_policy) throw new Error("policy not found");
            const result = await client.policy.put(_policy.package, _policy.raw);
            console.log(result);
            return result;
        },
        async execute(input: any, policy: { id: string }) {
            const _policy = await prisma.policy.findUniqueOrThrow({where: {id: policy.id}}).catch(() => undefined);
            if (!_policy) throw new Error("policy not found");
            await client.policy.put(_policy.package, _policy.raw);
            return client.data.post(_policy.package, {
                input
            });
        }
    },
} satisfies Service<"policy">;

export type PolicyService = typeof service;

ServiceManager.Load(service, import.meta).finally(() => console.log(`[Service][${service.name}] Loaded`))
