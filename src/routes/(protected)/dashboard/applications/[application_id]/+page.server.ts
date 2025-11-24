import {Guard} from "$lib/server/helpers/guard.helper";
import {form} from "$lib/server/helpers/form.helper";
import {SessionGuard} from "$lib/server/guards/session.guard";
import {ApplicationRepository} from "$lib/server/repositories/application.repository";
import {type Actions, error, fail, redirect} from "@sveltejs/kit";
import {randomUUID} from "node:crypto";

export const load = Guard.load(
    async ({params: {application_id}, guard: {session}}) => ({
        application: await ApplicationRepository.getById(application_id)
    }),
    SessionGuard.ensure
)

export const actions: Actions = {
    remove: Guard.action(async ({params: {application_id}}) => {
        await ApplicationRepository.delete(application_id)
        redirect(302, '/dashboard/applications')
    }, SessionGuard.ensure),
    testInbox: Guard.action(async (event) => {
        const { guard: { form }, params: {application_id} } = event;

        const application = await ApplicationRepository.getById(application_id)
        if (!application) return error(404);
        if (!application.inbox_url) return error (400, {message: 'application does not have an inbox url defined'});

        // Validate URL
        // let url: URL;
        // try {
        //     url = new URL(inboxUrl);
        //     if (url.protocol !== 'https:') {
        //         throw new Error('Must be HTTPS');
        //     }
        // } catch {
        //     return fail(400, {
        //         testInbox: true,
        //         error: 'Invalid HTTPS URL'
        //     });
        // }

        const testNotification = {
            '@context': 'https://www.w3.org/ns/ldn-context.jsonld',
            type: 'Notification',
            id: `urn:test:${randomUUID()}`,
            published: new Date().toISOString(),
            actor: {
                id: 'https://your-dataspace.example',
                type: 'Application',
                name: 'Your Dataspace'
            },
            summary: 'Test notification from Your Dataspace',
            object: {
                type: 'Message',
                content: 'This is a test.'
            }
        };

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds

        try {
            const res = await fetch(application.inbox_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/ld+json'
                },
                body: JSON.stringify(testNotification),
                signal: controller.signal // ← critical
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                return { testInbox: true, success: true };
            } else {
                return fail(400, {
                    testInbox: true,
                    error: `Inbox returned ${res.status} ${res.statusText}`
                });
            }
        } catch (err: any) {
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                return fail(400, {
                    message: 'Request timed out (5s)'
                });
            }

            // More helpful message for common issues
            let message = err.message || 'Failed to reach inbox';
            if (message.includes('fetch failed') || message.includes('ECONNREFUSED')) {
                message = 'Could not connect to inbox. Is the URL correct and publicly reachable?';
            } else if (message.includes('getaddrinfo ENOTFOUND')) {
                message = 'Hostname not found. Check the domain in your inbox URL.';
            } else if (message.includes('CERT')) {
                message = 'SSL certificate error. Inbox must use a valid HTTPS certificate.';
            }

            return fail(400, {
                message,
            });
        }
    }, form.guard)
}
