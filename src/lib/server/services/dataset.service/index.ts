import {type Service, ServiceManager} from "@sourceregistry/svelte-service-manager";
import routes from "$lib/server/services/dataset.service/routes";

const service = {
    name: "dataset",
    local: {
        access: (dataset: {id: string}) => {
            return "Testing123"
        }
    },
    route: routes
} satisfies Service<'dataset'>

export type DatasetService = typeof service;

await ServiceManager.Load(service, import.meta);
