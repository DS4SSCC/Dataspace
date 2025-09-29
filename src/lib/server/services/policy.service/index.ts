import type {Service} from "@sourceregistry/svelte-service-manager";
import {loadPolicy} from "@open-policy-agent/opa-wasm";


const service = {
    name: "policy",
    local: {

    }

} satisfies Service<'policy'>


export type PolicyService = typeof service;

export default service;
