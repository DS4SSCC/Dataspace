import {Guard} from "$lib/server/helpers/guard.helper";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";

export const load = Guard.load(async ({ params: {dataset_id} }) => {
    return {
        dataset: await DatasetRepository.getById(dataset_id)
    };
});
