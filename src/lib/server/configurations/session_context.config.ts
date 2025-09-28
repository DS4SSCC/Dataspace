import {type Cookies, type RequestEvent} from '@sveltejs/kit';
import {randomUUID} from 'node:crypto';
import {dev} from '$app/environment';
import {env} from '@sourceregistry/node-env';
import type {GuardInput} from '$lib/server/helpers/guard.helper';
import {prisma} from "$lib/server/configurations/prisma.config";
import {decode, type JWT, sign} from "@sourceregistry/node-jwt";
import {KeyStore} from "$lib/server/configurations/keystore.configuration";

export type SessionContext<E extends object = object, M extends Record<string, any> = Record<string, any>> =
    { user_id: string }
    & JWT['payload']
    & M & E;

export const PUBLIC_SESSION_COOKIE_NAME = env.string('PUBLIC_COOKIE_NAME', 'PJ_SRC') + '_SID';

export type SessionMetadata = NonNullable<App.Locals['session']>['meta'];

export const SessionContext = {
    create: async <M extends object = SessionMetadata>(
        user: { id: string },
        meta?: M,
        options: { /**@default 3600 (1h) */ EX?: number; prefix?: string } = {EX: 3600}
    ) => {
        const id = randomUUID();
        await prisma.session.create({
            data: {
                id,
                token: sign({sid: id, exp: Date.now() + ((options.EX || 3600) * 1000), ...meta}, KeyStore.private),
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })
        return {
            id,
            session: {
                id: id,
                user_id: user.id,
                meta
            }
        };
    },
    getById: async (
        sessionId?: string | null,
    ): Promise<SessionContext | undefined> => {
        if (!sessionId) return undefined;
        return prisma.session.findFirstOrThrow({
            where: {id: sessionId}
        }).then(({token, user_id}) => ({user_id, ...decode(token).payload}), () => undefined)
    },
    /**
     * Gathers the session context if a valid ssid is present in cookie.
     * @param event
     */
    hookContext: async (event: { locals: App.Locals; cookies: Cookies }) => {
        if (!event.cookies.get(PUBLIC_SESSION_COOKIE_NAME)) return event.locals.session;
        event.locals.session = await SessionContext.getById(event.cookies.get(PUBLIC_SESSION_COOKIE_NAME));
        if (!event.locals.session) return SessionContext.destroyContext(event).then(() => undefined);
        return event.locals.session;
    },
    hook: (input: GuardInput) => SessionContext.hookContext(input),
    createContext: (
        session: {
            user: { id: string };
            meta?: SessionMetadata;
        },
        event: { cookies: Cookies; locals: App.Locals }
    ) =>
        SessionContext.create({id: session.user.id}, session.meta).then(({id, session}) => {
            event.cookies.set(PUBLIC_SESSION_COOKIE_NAME, id, {path: `/`, secure: !dev});
            return (event.locals.session = session as NonNullable<App.Locals['session']>);
        }),
    enter: (session_id: string | undefined, event: RequestEvent) => {
        if (session_id)
            event.cookies.set(PUBLIC_SESSION_COOKIE_NAME, session_id, {path: '/', secure: !dev});
    },
    /**
     * Destroys the session context if present and redirects the user to `/logout`.
     * @param event
     */
    destroyContext: async (event: { locals?: App.Locals; cookies: Cookies }) => {
        if (event.locals?.session) await SessionContext.delete(event.locals.session);
        event.cookies.delete(PUBLIC_SESSION_COOKIE_NAME, {path: '/', secure: !dev});
    },
    delete: async (session_or_sessionId?: string | SessionContext) => {
        if (!session_or_sessionId) return false;
        let session: SessionContext | undefined;
        if (typeof session_or_sessionId === 'string') session = await SessionContext.getById(session_or_sessionId);
        else session = session_or_sessionId;
        if (!session) return false;
        return prisma.session.delete({where: {id: session.id}});
    }
};
