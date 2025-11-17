import {Guard} from "$lib/server/helpers/guard.helper";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";

export const load = Guard.load(async ({ locals }) => {
    return {
        datasets: await DatasetRepository.getAllWithCatalog(),
    };
});
