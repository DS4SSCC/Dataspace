import {ServiceManager} from "@sourceregistry/svelte-service-manager";
import PolicyService from "$lib/server/services/policy.service";

await ServiceManager.Load(PolicyService).then((s) => console.log(`[Service][${s.name}] Loaded`))
