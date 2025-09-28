import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export function localStorageStore<T>(key: string, initialValue: T): Writable<T> {
	// Initialize the store with the initial value
	const store = writable<T>(initialValue);

	if (browser) {
		// Retrieve the stored value from localStorage, if available
		const storedValue = localStorage.getItem(key);
		if (storedValue) {
			store.set(JSON.parse(storedValue));
		}

		// Subscribe to store changes and update localStorage accordingly
		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}
