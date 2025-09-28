import { readable } from 'svelte/store';

export type Sizes = keyof typeof sizes;
export type Sized<T = 'none' | 'show' | undefined, P = false> = P extends false ? Record<Sizes, T> : Partial<Record<Sizes, T>>;

export const sizes = {
	'xs': {
		breakpoint: 0,
	},
	'sm': {
		breakpoint: 576,
	},
	'md': {
		breakpoint: 768,
	},
	'lg': {
		breakpoint: 992,
	},
	'xl': {
		breakpoint: 1200,
	},
	'xxl': {
		breakpoint: 1400,
	},
}

export const {xs, sm, md, lg, xl, xxl} = sizes;

// Individual breakpoint stores
export const isXs = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.matchMedia(`(max-width: ${sizes.sm.breakpoint - 1}px)`).matches);
	check();
	const mediaQuery = window.matchMedia(`(max-width: ${sizes.sm.breakpoint - 1}px)`);
	const handleChange = () => check();
	mediaQuery.addEventListener('change', handleChange);
	return () => mediaQuery.removeEventListener('change', handleChange);
});

export const isSm = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.matchMedia(`(min-width: ${sizes.sm.breakpoint}px) and (max-width: ${sizes.md.breakpoint - 1}px)`).matches);
	check();
	const mediaQuery = window.matchMedia(`(min-width: ${sizes.sm.breakpoint}px) and (max-width: ${sizes.md.breakpoint - 1}px)`);
	const handleChange = () => check();
	mediaQuery.addEventListener('change', handleChange);
	return () => mediaQuery.removeEventListener('change', handleChange);
});

export const isMd = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.matchMedia(`(min-width: ${sizes.md.breakpoint}px) and (max-width: ${sizes.lg.breakpoint - 1}px)`).matches);
	check();
	const mediaQuery = window.matchMedia(`(min-width: ${sizes.md.breakpoint}px) and (max-width: ${sizes.lg.breakpoint - 1}px)`);
	const handleChange = () => check();
	mediaQuery.addEventListener('change', handleChange);
	return () => mediaQuery.removeEventListener('change', handleChange);
});

export const isLg = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.matchMedia(`(min-width: ${sizes.lg.breakpoint}px) and (max-width: ${sizes.xl.breakpoint - 1}px)`).matches);
	check();
	const mediaQuery = window.matchMedia(`(min-width: ${sizes.lg.breakpoint}px) and (max-width: ${sizes.xl.breakpoint - 1}px)`);
	const handleChange = () => check();
	mediaQuery.addEventListener('change', handleChange);
	return () => mediaQuery.removeEventListener('change', handleChange);
});

export const isXl = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.matchMedia(`(min-width: ${sizes.xl.breakpoint}px) and (max-width: ${sizes.xxl.breakpoint - 1}px)`).matches);
	check();
	const mediaQuery = window.matchMedia(`(min-width: ${sizes.xl.breakpoint}px) and (max-width: ${sizes.xxl.breakpoint - 1}px)`);
	const handleChange = () => check();
	mediaQuery.addEventListener('change', handleChange);
	return () => mediaQuery.removeEventListener('change', handleChange);
});

export const isXxl = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.matchMedia(`(min-width: ${sizes.xxl.breakpoint}px)`).matches);
	check();
	const mediaQuery = window.matchMedia(`(min-width: ${sizes.xxl.breakpoint}px)`);
	const handleChange = () => check();
	mediaQuery.addEventListener('change', handleChange);
	return () => mediaQuery.removeEventListener('change', handleChange);
});

// The is() function you wanted
export function is(breakpoint: Sizes) {
	switch (breakpoint) {
		case 'xs': return isXs;
		case 'sm': return isSm;
		case 'md': return isMd;
		case 'lg': return isLg;
		case 'xl': return isXl;
		case 'xxl': return isXxl;
		default: return isXs;
	}
}

// isMobile store (under md breakpoint)
export const isMobile = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const check = () => set(window.innerWidth < sizes.md.breakpoint);
	check();
	const handleChange = () => check();
	window.addEventListener('resize', handleChange);
	return () => window.removeEventListener('resize', handleChange);
});

// Active breakpoint store
export const activeBreakpoint = readable<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>('xs', (set) => {
	if (typeof window === 'undefined') return;

	const check = () => {
		const width = window.innerWidth;

		if (width < sizes.sm.breakpoint) {
			set('xs');
		} else if (width < sizes.md.breakpoint) {
			set('sm');
		} else if (width < sizes.lg.breakpoint) {
			set('md');
		} else if (width < sizes.xl.breakpoint) {
			set('lg');
		} else if (width < sizes.xxl.breakpoint) {
			set('xl');
		} else {
			set('xxl');
		}
	};

	check();
	const handleChange = () => check();
	window.addEventListener('resize', handleChange);

	return () => {
		window.removeEventListener('resize', handleChange);
	};
});


