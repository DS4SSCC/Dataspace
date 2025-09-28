import {randomUUID} from "node:crypto";
import {clearTimeout} from "node:timers";

export type SessionOptions = {
    id: string,
    /**
     * Time To Live in ms
     * @default 3600000 (1h)
     */
    ttl: number,
    /**
     * Function that removes reference to session
     * @param id
     */
    disposer: (session: Session<any>) => Promise<any> | any
}

export class Session<D = Record<string, any>> implements Disposable {

    public readonly created_at: Date = new Date();
    private options: SessionOptions;
    private timeout!: number | NodeJS.Timeout;

    get ttl() {
        return this.options.ttl;
    }

    get id() {
        return this.options.id;
    }

    constructor(public data: D, options: Pick<SessionOptions, 'disposer' | 'ttl'>) {
        const {ttl = 3600_000, disposer} = options;
        this.options = {
            id: randomUUID(),
            ttl,
            disposer
        }
        this.resetTTL()
    }

    resetTTL(ttl: number = this.options.ttl) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this[Symbol.dispose](), ttl)
    }

    [Symbol.dispose](): void {
        Promise.reject(this.options.disposer(this)).catch(console.error)
        clearTimeout(this.timeout)
    }

}

const sessions = new Set<Session>()

export const SessionRepository = {
    create: (user: { id: string }, metadata?: Record<string, any>, ttl: number = 3600_000) => {
        sessions.add(new Session({
            user,
            metadata,
        }, {
            ttl,
            disposer: (ref) => sessions.delete(ref)
        }))

    },
    delete: (session: Session | { id: string }) => {
        if (!(session instanceof Session)) {
            const ref = sessions.values().find(({id}) => id === session.id)
            if (!ref) return false;
            return sessions.delete(ref)
        }
        const deleted = sessions.delete(session)
        if (!deleted) {
            const ref = sessions.values().find(({id}) => id === session.id)
            if (!ref) return false;
            return sessions.delete(ref)
        }
        return deleted;
    },
    resetTTL: (session: Session | { id: string }, ttl?: number) => {
        if (!(session instanceof Session)) {
            const ref = sessions.values().find(({id}) => id === session.id)
            if (!ref) return false;
            ref.resetTTL(ttl)
        } else {
            session.resetTTL(ttl)
        }
    }
}
