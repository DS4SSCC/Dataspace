import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {CatalogRepository} from "$lib/server/repositories/catalog.repository";

export const load = async () => {
    return {
        datasets: await DatasetRepository.getAll(),
        catalogs: await CatalogRepository.getAll()
    }
}
