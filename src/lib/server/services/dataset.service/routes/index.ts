import {middleware, Router, Service} from "@sourceregistry/svelte-service-manager";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {error} from "$lib/server/helpers/guard.helper";
import {SessionGuard} from "$lib/server/guards/session.guard";

const router = Router();

router.GET("/[dataset_id]", middleware(async ({params: {dataset_id}, guard: {session}}) => {
    const dataset = await DatasetRepository.getById(dataset_id).catch(() => undefined);
    if (!dataset) return error(404, {message: 'Dataset not found'});
    if (dataset.policy) {
        const input = {
            session,
            user: session.user,
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
}, SessionGuard.require))

export default router;
