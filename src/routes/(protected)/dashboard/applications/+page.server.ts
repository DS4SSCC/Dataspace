import {Guard} from "$lib/server/helpers/guard.helper";
import {form} from "$lib/server/helpers/form.helper";
import {type Actions, fail, redirect} from "@sveltejs/kit";
import {ApplicationRepository} from "$lib/server/repositories/application.repository";
import {randomUUID} from "node:crypto";
import {SessionGuard} from "$lib/server/guards/session.guard";

export const load = Guard.load(
    async ({guard: {session}}) => ({
        application: await ApplicationRepository.getAllFromUser(session.user.id)
    }),
    SessionGuard.ensure
)


export const actions: Actions = {
    create: Guard.action(async (event) => {
        const {guard: {form}} = event;

        const name = form.string$('application.name');
        const description = form.string$('application.description');
        const inbox_url = form.string$('application.inbox_url');

        // Validate inbox_url is a valid HTTPS URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(inbox_url);
            if (parsedUrl.protocol !== 'https:') {
                throw new Error('Must use HTTPS');
            }
        } catch (e) {
            return fail(400, {
                message: 'Inbox URL must be a valid HTTPS URL (e.g. https://example.com/ldn/inbox)'
            });
        }

        // Optional: enforce that inbox ends with /inbox (adjust as needed)
        if (!parsedUrl.pathname.endsWith('/inbox')) {
            return fail(400, {
                message: 'Inbox URL should typically end with "/inbox"'
            });
        }

        // Create the application
        const app = await ApplicationRepository.create({
            name,
            description,
            inbox_url: parsedUrl.href, // normalize URL
            api_key: randomUUID()
        });

        // Redirect to detail page or list
        redirect(303, `/dashboard/applications/${app.id}`);
    }, form.guard)
}
