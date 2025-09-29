import type { GuardInput } from '$lib/server/helpers/guard.helper';

export const StatusGuard = {
	monitor: (input: GuardInput<'handle'>) => {
		console.info(`[${input.request.method}] ${input.request.url.toString()}`);
		input.responseHandlers.push(({ event, response }) => {
            console.info(`[${response.status}] ${response.statusText}`);
			if (response.status === 404) {
                console.warn(`[${response.status}] ${response.statusText} ${event.request.url}`);
			} else if (response.status === 405) {
                console.warn(
					`[${response.status}] [${event.request.method}] ${response.statusText} ${event.request.url}`,
					event.request.headers
				);
			} else if (response.status >= 500) {
                console.error(`[${response.status}] ${response.statusText} ${event.request.url}`);
			}
		});
	}
};
