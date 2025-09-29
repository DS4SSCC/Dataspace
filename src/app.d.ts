// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {Session} from "$lib/server/guards/session.guard";
import type {PolicyService} from "$lib/server/services/policy.service";

declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            session?: Session
        }

        interface Services {
            policy: PolicyService
        }

        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
