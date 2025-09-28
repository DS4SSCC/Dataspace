import {SessionContext} from '$lib/server/configurations/session_context.config';
import {Guard} from '$lib/server/helpers/guard.helper';
import {StatusGuard} from "$lib/server/guards/status.guard";

export const handle = Guard.handle(
    ({resolve, event}) => resolve(event),
    StatusGuard.monitor,
    SessionContext.hook
);
