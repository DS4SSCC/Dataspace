import {middleware, Router, Service} from "@sourceregistry/svelte-service-manager";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {error} from "$lib/server/helpers/guard.helper";
import {TokenGuard} from "$lib/server/guards/token.guard";

const router = Router();

router.GET("/[dataset_id]", middleware(async ({params: {dataset_id}, guard: {token}}) => {
    const dataset = await DatasetRepository.getById(dataset_id).catch(() => undefined);
    if (!dataset) return error(404, {message: 'Dataset not found'});
    if (dataset.policy) {
        const input = {
            ...token,
            dataset
        }
        const {result} = await Service('policy').execute(input, dataset.policy)
        if (!result?.allowed) {
            // @ts-ignore
            return error(403, {message: 'Policy verification failed', reason: result?.reason});
        }
    }
    const result = Service('dataset').access(dataset)
    return new Response(result);
}, TokenGuard.require))

export default router;
