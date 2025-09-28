import { writable } from 'svelte/store';

export const page = writable<{title?: string; description?: string }>({});
export const theme= writable<string>('light');
