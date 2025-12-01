import {Guard} from "$lib/server/helpers/guard.helper";
import {SessionGuard} from "$lib/server/guards/session.guard";
import {PolicyRepository} from "$lib/server/repositories/policy.repository";

export const load = Guard.load(() => ({policies: PolicyRepository.list()}), SessionGuard.ensure)
