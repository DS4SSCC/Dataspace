<script lang="ts" module>
	import type {
		ChangeEventHandler,
		FocusEventHandler,
		HTMLInputAttributes,
		KeyboardEventHandler
	} from 'svelte/elements';
	export type Props = {
		name?: string;
		value?: string;
		placeholder?: string | null | undefined;
		element?: HTMLInputElement;
		style?: string;
		inputStyle?: string;
		readonly?: boolean;
		required?: boolean;

		// Events
		onchange?: ChangeEventHandler<HTMLInputElement> | undefined | null,
		onfocus?: FocusEventHandler<HTMLInputElement> | null | undefined,
		onkeyup?: KeyboardEventHandler<HTMLInputElement> | null | undefined,
		onkeydown?: KeyboardEventHandler<HTMLInputElement> | null | undefined,
	} & HTMLInputAttributes;
</script>

<script lang="ts">
	let {
		name,
		placeholder,
		required,
		readonly,
		style,
		value = $bindable(),
		element = $bindable(),
		onchange,
		onfocus,
		onkeyup,
		onkeydown,
		...restProps
	}: Props = $props();
</script>

<input
	type='text'
	class="form-control"
	id={`input-${name}`}
	name={name}
	bind:this={element}
	bind:value
	{style}
	{placeholder}
	{required} {readonly}
	{onchange} {onfocus} {onkeyup} {onkeydown}
	{...restProps} />

<style lang="scss">
  @use 'sass:map';
  @use "$lib/client/styles/base/variables";
  @use "$lib/client/styles/mixins/input";

  input {
    @include input.base_input;
    min-width: 100%;
    max-width: 100%;
  }
</style>
