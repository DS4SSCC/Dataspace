import { session } from '$lib/client/stores/session.store.svelte';

export default new (class UI {
	sidebar = $state({ show: true });
	session = session;
})();
