<script lang="ts" module>
	import type {
		ChangeEventHandler,
		FocusEventHandler,
		HTMLSelectAttributes,
		KeyboardEventHandler
	} from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type SelectOption = {
		value?: string,
		id?: string,
		label?: string,
		selected?: boolean,
	}
	export type Props = {
		name?: string;
		value?: string,
		placeholder?: string | null;
		element?: HTMLSelectElement;
		style?: string,
		readonly?: boolean,
		required?: boolean,
		options?: SelectOption[] | string[] | undefined | Snippet,
		children?: Snippet<[string]>,
		multiple?: boolean,

		// Events
		onchange?: ChangeEventHandler<HTMLSelectElement> | undefined | null,
		onfocus?: FocusEventHandler<HTMLSelectElement> | null | undefined,
		onkeyup?: KeyboardEventHandler<HTMLSelectElement> | null | undefined,
		onkeydown?: KeyboardEventHandler<HTMLSelectElement> | null | undefined,
	} & HTMLSelectAttributes;
</script>

<script lang="ts">
	let {
		name,
		style,
		required,
		readonly,
		placeholder,
		options = $bindable(),
		value = $bindable(),
		element = $bindable(),
		onchange,
		onfocus,
		onkeyup,
		onkeydown,
		multiple,
		children
	}: Props = $props();

	function change(event: Event & { currentTarget: (EventTarget & HTMLSelectElement) }) {
		if (multiple) value = Array.from(event.currentTarget.selectedOptions).map(opt => opt.value) as typeof value;
		else value = event.currentTarget.value as typeof value;
		onchange?.(event);
	}
</script>

<select
	bind:this={element}
	id={`input-${name}`}
	class="form-control"
	class:readonly
	{name}
	{multiple}
	onchange={change}
	{onfocus} {onkeydown} {onkeyup}
	{style}
	{required}
>
	{#if typeof options === 'function'}
		{@render options?.()}
	{:else if Array.isArray(options)}
		{#if placeholder}
			<option class="placeholder" id={`input-${name}-placeholder`} value={undefined}>
				{placeholder}
			</option>
		{/if}
		{#each options as option, i}
			{#if typeof option === 'string'}
				<option
					id={`input-${name}-option[${i}]`}
					selected={(multiple ? value?.includes(option) : value === option) || value === option}
					value={option}
				>
					{ option}
				</option>
			{:else}
				<option
					id={option.id ?? `input-${name}-option[${i}]`}
					selected={(multiple ? value?.includes(option.value) : value === option.value) || option.selected}
					value={option.value}
				>
					{option?.label ?? option.value}
				</option>
			{/if}
		{/each}
	{/if}
</select>
{@render children?.(value)}

<style lang="scss">
  @use 'sass:map';
  @use "$lib/client/styles/base/variables";
  @use "$lib/client/styles/mixins/input";

  select {
    @include input.base_input;

    &.readonly {
      pointer-events: none;
    }

    option.placeholder {
      color: var(--color-text-secondary)
    }
  }
</style>
