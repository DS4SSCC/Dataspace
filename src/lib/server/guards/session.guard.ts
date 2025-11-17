import {UserRepository} from '$lib/server/repositories/user.repository';
import type {SessionContext} from '$lib/server/configurations/session_context.config';
import {encode} from 'node:querystring';
import assert from 'assert';
import {type GuardInput, not_good} from '$lib/server/helpers/guard.helper';
import {redirect} from '@sveltejs/kit';

const SessionExtension = async (session: SessionContext, event: GuardInput) => ({
    user: await UserRepository.getSessionUserFormat(session.user_id)
        .then((user) => ({...user, ...session.meta}))
        .catch(() =>
            not_good(event, 401, {
                message:
                    'Your account has been disabled or deleted. Please contact the system administrator.'
            })
        )
});

type SessionExt = Awaited<ReturnType<typeof SessionExtension>>;

export type SessionMeta = any;

export type Session = SessionContext<SessionExt, SessionMeta>;

export const SessionGuard = {
    /**
     * Know for sure if there is a session present.
     * If not then error/fail
     * else return session information
     * @param input
     */
    require: async (input: GuardInput) => {
        if (!input.locals.session)
            return not_good(input, 401, {message: 'Not logged in.', href: '/'});
        input.locals.session = {
            ...input.locals.session,
            ...(await SessionExtension(input.locals.session, input))
        };
        return {
            session: input.locals.session as NonNullable<App.Locals['session']>
        };
    },
    optional: async (input: GuardInput) => {
        if (input.locals.session)
            input.locals.session = {
                ...input.locals.session,
                ...(await SessionExtension(input.locals.session, input))
            };

        return {
            session: input.locals.session
        };
    },
    /**
     * Ask the user to log in if no session exists and return to the original point when logged-in.
     * @param input RequestEvent
     */
    ensure: async (input: GuardInput) => {
        if (!input.locals.session && input.callType !== 'action')
            return redirect(302, `/login?${encode({redirect_uri: input.url.toString()})}`);
        else if (!input.locals.session)
            return not_good(input, 401, {message: 'Not logged in.', href: '/'});
        assert(input.locals.session, 'Session not present');
        input.locals.session = {
            ...input.locals.session,
            ...(await SessionExtension(input.locals.session, input))
        };
        return {
            session: input.locals.session as NonNullable<App.Locals['session']>
        };
    }
};
