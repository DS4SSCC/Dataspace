<script lang="ts" module>
	import type {
		ChangeEventHandler,
		FocusEventHandler,
		KeyboardEventHandler,
		HTMLInputAttributes
	} from 'svelte/elements';
	import type { ButtonProps } from '$lib/client/components/Button.svelte';

	export type Tag = string;

	export type Props = {
		name?: string;
		value?: Tag[];
		placeholder?: string;
		element?: HTMLDivElement | null;
		style?: string;
		inputStyle?: string;
		readonly?: boolean;
		required?: boolean;
		// Events
		onchange?: ChangeEventHandler<HTMLInputElement> | null;
		onfocus?: FocusEventHandler<HTMLInputElement> | null;
		onkeyup?: KeyboardEventHandler<HTMLInputElement> | null;
		onkeydown?: KeyboardEventHandler<HTMLInputElement> | null;
	} & HTMLInputAttributes & Pick<ButtonProps, 'size'>;
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import Button from '$lib/client/components/Button.svelte';

	let {
		value = $bindable<Tag[]>(),
		name,
		readonly = false,
		required = false,
		placeholder = '',
		size = 'xs' as const,
		onchange = null,
		onfocus = null,
		onkeyup = null,
		onkeydown = null
	} = $props() as Props & { element?: HTMLDivElement | null };

	// Internal state
	let tagInput: HTMLInputElement | null = $state(null);

	// Sync incoming `value` → localValue
	$effect.pre(() => {
		if (value === undefined) value = [];
	});


	function onKeyDown(e: KeyboardEvent) {
		const input = e.target as HTMLInputElement;
		if (!input) return;

		onkeydown?.(e);

		const inputValue = input.value.trim();

		// Add tag on Enter or Space
		if (e.key === 'Enter' || e.code === 'Space') {
			e.preventDefault();
			if (inputValue && !value.some(tag => tag === inputValue)) {
				value = [...value, inputValue];
				input.value = '';
				onchange?.(e as any);
			}
		}
		// Remove last tag on Backspace if input is empty
		else if (inputValue === '' && e.code === 'Backspace') {
			e.preventDefault();
			if (value.length > 0) {
				value = value.slice(0, -1);
				onchange?.(e as any);
			}
		}
	}

	function removeTag(index: number, e: Event) {
		e.stopPropagation();
		value = value.filter((_, i) => i !== index);
		onchange?.(e as any);
	}
</script>

<div
	class="tags-container"
	role={tagInput ? "presentation" : undefined}
	onclick={() => tagInput?.focus()}
>
	{#each value as tag, i (tag)}
		<div class="tag-container form-control" transition:fly={{ y: 10 }}>
			<Button variant="primary" {size} class="tag" onclick={(e: Primitive.any) => removeTag(i, e)}>{tag}</Button>
			<!-- Hidden input for form submission (individual tags) -->
			<input
				class="tag"
				{name}
				type="hidden"
				value={tag}
				{required}
			/>
		</div>
	{/each}

	{#if (!readonly)}
		<input
			class="tag-input"
			type="text"
			{placeholder}
			onkeydown={onKeyDown}
			onkeyup={(e) => onkeyup?.(e)}
			onfocus={(e) => onfocus?.(e)}
			bind:this={tagInput}
		/>
	{/if}
</div>

<style lang="scss">
  @use "$lib/client/styles/mixins/input";

  .tags-container {
    @include input.base_input;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
		margin-bottom: 0.5rem;


    .tag-input {
      background: none;
      border: none;
      outline: none;
      font: inherit;
      color: currentColor;
      flex: 1;
      min-width: 8ch;
      padding: 0;
      margin: 0;

      &:focus,
      &:hover {
        background: none;
      }
    }

    :global(.tag) {
      margin: 0;

    }
  }
</style>
