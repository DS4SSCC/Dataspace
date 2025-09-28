<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { page } from '$app/state';
	import Input from '$lib/client/components/form/Input.svelte';

	interface Props {
		//region props
		context?: Record<string, any> | undefined;
		continuous?: boolean;
		properties?: string[];
		placeholder?: string | undefined;
		result?: any[]
		debug?: boolean;
		paged?: boolean
		page_offset?: number;
		page_limit?: number;
		block?: boolean;
		action?: string;
		preload?: boolean;
		value?: string | undefined | null;
		name?: string | undefined;
		useSearchParamQuery?: boolean;
        inputElement?: HTMLInputElement;
		searchbar?: Snippet<[any[], typeof search, typeof error | undefined]>;
		children?: Snippet<[any[], typeof error, typeof search, () => Promise<any[]>]>;

		[key: string]: any

		onreset?: () => any[],
		onresult?: (input: { status: number; statusText: string; result: any[] }) => any[]
		onerror?: (input: { status: number; statusText: string; error?: any }) => any
	}

	let {
		context,
		continuous = false,
		properties = [],
		placeholder = undefined,
		debug = false,
		block = false,
		action = '?/search',
		preload = $bindable(false),
		value = $bindable(undefined),
		result = $bindable([]),
		data = $bindable(undefined),
		name = undefined,
        inputElement = $bindable(),
		useSearchParamQuery = false,
		paged = false,
		page_offset = 0,
		page_limit = 10,
		searchbar,
		children,
		onreset,
		onresult,
		onerror,
		...rest
	}: Props = $props();
	//endregion

	if (useSearchParamQuery && page.url.searchParams.has('query') && !value) {
		value = page.url.searchParams.get('query') ?? undefined;
	}


	$effect(() => result = data);

	let error: { status: number; statusText: string; error: ActionResult } | undefined = $state(undefined);

	async function search(value: string) {
		let q: Record<string, any> = { context };
		properties.forEach((property) => q[property] = { value });

		if (value.length === 0 && !preload) return onreset?.();

		const formData = new FormData();
		formData.set('query', JSON.stringify(q));

		const searchParams = new URLSearchParams();
		if (paged) {
			searchParams.set('limit', page.url.searchParams.get('limit') ?? page_limit.toString());
			searchParams.set('offset', page.url.searchParams.get('limit') ?? page_offset.toString());
		}
		const res = await fetch(`${action}&${searchParams.toString()}`, {
			method: 'POST',
			body: formData
		});

		const data = await res.text().then((t) => deserialize(t));

		if (debug) (res.ok ? console.debug : console.error)({
			status: res.status,
			statusText: res.statusText,
			content: data
		});

		if (typeof data === 'object') {
			switch (data.type) {
				case 'success': {
					result = data.data as unknown as any[];
					return onresult?.({ status: res.status, statusText: res.statusText, result });
				}
				default: {
					error = { status: res.status, statusText: res.statusText, error: data };
					return onerror?.({ status: res.status, statusText: res.statusText, error: data });
				}
			}
		}
		preload = false;
	}

	const reset = (v?: string) => v?.length === 0 ? (result = onreset?.() ?? data ?? []) : undefined;

	onMount(() => (preload || value) ? search(value ?? '').catch(console.error) : undefined);

	const externalSearch = (val: string) => search(value = val);


</script>

{#if searchbar}
	<div style="display: flex; column-gap: .25rem; align-items: center; flex-direction: row-reverse">
		<Input type="text"
			{name}
			{placeholder}
			bind:value={value}
            bind:element={inputElement}
			autocomplete="off"
			oninput={(e) => (continuous ? search(e.target?.['value']) : reset(e.target?.['value']))}
			onkeyup={(e) => (e.key === 'Enter' ? search(e.target?.['value']) : (e.key === "Escape")? reset(value = ''): search(e.target?.['value'] ?? ''))}
			{...rest}
		/>
		{@render searchbar?.(result, externalSearch, error)}
	</div>
{:else}
	<Input type="text"
		{name}
		{placeholder}
		bind:value={value}
		autocomplete="off"
		oninput={(e) => (continuous ? search(e.target?.['value']) : reset(e.target?.['value']))}
		onkeyup={(e) => (e.key === 'Enter' ? search(e.target?.['value']) : (e.key === "Escape")? reset(value = ''):  search(e.target?.['value'] ?? ''))}
		{...rest}
	/>
{/if}

{@render children?.(result, error, externalSearch, () => search(value ?? ''))}
