// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {Session} from "$lib/server/guards/session.guard";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
            session?: Session
        }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
