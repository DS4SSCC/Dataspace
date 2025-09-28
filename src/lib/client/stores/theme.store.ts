import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'auto';

const THEME_KEY = 'theme';

function getStoredTheme(): Theme {
	// Safely check localStorage in the browser
	if (typeof window !== 'undefined' && localStorage) {
		const stored = localStorage.getItem(THEME_KEY) as Theme | null;
		return stored ?? 'auto';
	}
	return 'auto'; // Default for SSR
}

function setStoredTheme(theme: Theme) {
	// Only set localStorage in the browser
	if (typeof window !== 'undefined' && localStorage) {
		localStorage.setItem(THEME_KEY, theme);
	}
}

// Initialize the store with a default theme for SSR
export const theme = writable<Theme>('auto');

// Run browser-specific logic after the app is hydrated
if (typeof window !== 'undefined') {
	// Set the initial theme from localStorage
	theme.set(getStoredTheme());

	// Subscribe to theme changes to update localStorage and the DOM
	theme.subscribe((value) => {
		setStoredTheme(value);

		if (value === 'auto') {
			updateThemeBasedOnSystemPreference();
		} else {
			document.documentElement.setAttribute('data-theme', value);
		}
	});

	// Watch system theme changes for auto mode
	const systemDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	systemDarkMediaQuery.addEventListener('change', () => {
		if (getStoredTheme() === 'auto') {
			updateThemeBasedOnSystemPreference();
		}
	});
}

function updateThemeBasedOnSystemPreference() {
	const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
}
