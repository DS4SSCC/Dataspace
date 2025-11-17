import {DatasetRepository} from "$lib/server/repositories/dataset.repository";

export const load = async ({params}) => {
    return {
        dataset: await DatasetRepository.getById(params.dataset_id),
    }
}
