export const ssr = false;

import {session} from "$lib/client/stores/session.store.svelte";

export const load = ({data}) => {
    return {
        ...data,
        session: session.load(data.session)
    }
}
