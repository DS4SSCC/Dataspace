import {Guard} from "$lib/server/helpers/guard.helper";
import {SessionGuard} from "$lib/server/guards/session.guard";

export const load = Guard.load(
    ({guard: {session}}) => ({session}),
    SessionGuard.ensure
)
