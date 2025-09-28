<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type FormProps = {
		id?: string,
		action?: string
		reset?: boolean,
		method?: 'POST' | 'GET',
		enctype?: 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'text/plain',
		includeSearchParams?: boolean,
		invalidateAll?: boolean,
		debug?: boolean,
		feedback?: string | Snippet<[{ form: HTMLFormElement, message: string | undefined }]>,
		form?: HTMLFormElement | undefined,
		failure?: Snippet<[{ form: HTMLFormElement, failure: string }]>
		children?: Snippet<[{ form: HTMLFormElement, failure?: string, reset: () => void }]>
		onreset?: (form: HTMLFormElement) => any;
		onsubmit?: (input: { form: HTMLFormElement, formData: FormData }) => boolean | unknown;
		onresult?: (input: { form: HTMLFormElement, result: ActionResult }) => any;
		onsuccess?: (input: ActionResult & { type: 'success' }) => any;
		onfailure?: (input: ActionResult & { type: 'failure' }) => any;
		onerror?: (input: ActionResult & { type: 'error' }) => any;
		onredirect?: (input: ActionResult & { type: 'redirect' }) => any;
		style?: string
		class?: string
		name?: string
		autocomplete?: 'on' | 'off'
	}
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import { page } from '$app/state';

	let {
		id,
		debug = false,
		action = '?',
		children,
		reset = true,
		invalidateAll = true,
		feedback = $bindable(undefined),
		form = $bindable(undefined),
		method = 'POST',
		enctype = method === 'POST' ? 'multipart/form-data' : 'application/x-www-form-urlencoded',
		includeSearchParams = true,
		onreset,
		onsubmit,
		onresult,
		onerror,
		onsuccess,
		onfailure,
		onredirect,
		...restProps
	}: FormProps = $props();

	let failure = $state<string | undefined>(undefined);

	let _action = includeSearchParams
		? action.includes('?')
			? `${action}${action.endsWith('?') ? '' : '&'}${page.url.searchParams.toString()}`
			: `${action}?${page.url.searchParams.toString()}`
		: action;

	const FeedbackController = {
		reset: () => {
			if (!form) return;
			const inputElements = form?.getElementsByTagName('input');
			failure = undefined;
			for (const input of inputElements) {
				input.classList.remove('is-invalid');
				input.removeAttribute('message');
			}
			onreset?.(form);
		},
		process: (result: ActionResult & { type: 'failure' }) => {
			if (!result.data) return;
			if (result.data?.data?.targets?.length > 0 && result.data?.message) {
				const inputElements = form?.getElementsByTagName('input');
				for (const input of inputElements ?? []) {
					if (result.data.data.targets.some((item: string) => item === input.name)) {
						input.classList.add('is-invalid');
						input.setAttribute('message', result.data.message.replace(/(\S)\.(\S)/g, '$1 $2'));
						result.data.data.targets = result.data.data.targets.filter((item: string) => item !== input.name);
					}
				}
				if (result.data.targets?.length > 0) failure = result.data.message.replace(/(\S)\.(\S)/g, '$1 $2');
			} else if (result.data?.message) {
				failure = result.data.message.replace(/(\S)\.(\S)/g, '$1 $2') ?? result.data.message;
			}
		}
	};

	const actionHandler: SubmitFunction = ({ formElement: form, formData, cancel }) => {
		const result = onsubmit?.({ form, formData });
		if (result === false) {
			if (debug) console.warn('[DEBUG]', `form(${id}):submit canceled`, { formData, form });
			return cancel();
		}
		if (debug) console.warn('[DEBUG]', `form(${id}):submit`, { formData, form });
		FeedbackController.reset();
		return ({ result, update, formElement }) => {
			onresult?.({ form, result });
			switch (result.type) {
				case 'success': {
					onsuccess?.(result);
					break;
				}
				case 'failure': {
					onfailure?.(result);
					break;
				}
				case 'error': {
					onerror?.(result);
					break;
				}
				case 'redirect': {
					onredirect?.(result);
					break;
				}
			}
			if (debug) console.warn('[DEBUG]', `form(${id}):response`, { result, formElement });
			if (result.type === 'failure') FeedbackController.process(result);
			return update({ reset, invalidateAll });
		};
	};
</script>

{#if method === 'POST'}
	<form {id} bind:this={form} action={_action} {method} use:enhance={actionHandler} {enctype} {...restProps}>
		{#if failure}
			{#if typeof feedback === 'function'}
				{@render feedback({ form, message: failure })}
			{:else}
            <span class="invalid-feedback">
                <Icon icon="exclamation-circle" margin="right" />
                Error: {failure}
            </span>
			{/if}
		{/if}
		{@render children?.({
			form, failure, reset: () => {
				FeedbackController.reset();
				form?.reset?.();
			}
		})}
	</form>
{:else}
	<form {id} bind:this={form} action={_action} {method} {enctype} {...restProps}>
		{#if failure}
			{#if typeof feedback === 'function'}
				{@render feedback({ form, message: failure })}
			{:else}
            <span class="invalid-feedback">
                <Icon icon="exclamation-circle" margin="right" />
                Error: {failure}
            </span>
			{/if}
		{/if}
		{@render children?.({
			form, failure, reset: () => {
				FeedbackController.reset();
				form?.reset?.();
			}
		})}
	</form>
{/if}


<style lang="scss">
  @use "sass:map";
  @use "$lib/client/styles/base/variables" as variables;

  .invalid-feedback {
    display: block;
    padding: .5rem;
    border: solid 1px var(--color-danger);
    color: var(--color-text-primary);
    border-radius: map.get(variables.$border-radii, "md");
    margin-bottom: 1rem;
  }
</style>

