import {DatasetRepository} from "$lib/server/repositories/dataset.repository";

export const load = async () => {
    return {
        datasets: await DatasetRepository.getAll()
    }
}
