import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {CatalogRepository} from "$lib/server/repositories/catalog.repository";
import {SectorRepository} from "$lib/server/repositories/sector.repository";
import {Guard} from "$lib/server/helpers/guard.helper";
import {SessionGuard} from "$lib/server/guards/session.guard";

export const load = Guard.load(async ({guard: {session}}) => {
    return {
        session,
        sectors: SectorRepository.getAll(),
        catalogs: await CatalogRepository.getAll()
    }
}, SessionGuard.optional)
