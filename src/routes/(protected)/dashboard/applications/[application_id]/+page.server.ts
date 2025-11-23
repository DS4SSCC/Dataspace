import {Guard} from "$lib/server/helpers/guard.helper";
import {SessionGuard} from "$lib/server/guards/session.guard";
import {ApplicationRepository} from "$lib/server/repositories/application.repository";

export const load = Guard.load(
    async ({params: {application_id}, guard: {session}}) => ({
        application: await ApplicationRepository.getById(application_id)
    }),
    SessionGuard.ensure
)
