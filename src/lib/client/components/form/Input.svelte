<script lang="ts" module>
	import type {
		HTMLInputTypeAttribute
	} from 'svelte/elements';
</script>
<script lang="ts" generics="T extends (HTMLInputTypeAttribute | 'tags' | 'select' | 'textarea')">
	import type {
		ChangeEventHandler,
		FocusEventHandler, HTMLInputAttributes,
		KeyboardEventHandler
	} from 'svelte/elements';

	import TextInput, { type Props as TextInputProps } from '$lib/client/components/form/inputs/TextInput.svelte';
	import NumberInput, {
		type Props as NumberInputProps
	} from '$lib/client/components/form/inputs/NumberInput.svelte';
	import SelectInput, {
		type Props as SelectInputProps
	} from '$lib/client/components/form/inputs/SelectInput.svelte';
	import TagsInput, { type Props as TagsInputProps } from '$lib/client/components/form/inputs/TagsInput.svelte';
	import TextareaInput, {
		type Props as TextareaInputProps
	} from '$lib/client/components/form/inputs/TextareaInput.svelte';
	import CheckboxInput, {
		type Props as CheckboxInputProps
	} from '$lib/client/components/form/inputs/CheckboxInput.svelte';
	import FileInput, { type Props as FileInputProps } from '$lib/client/components/form/inputs/FileInput.svelte';
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import type { Snippet } from 'svelte';
	import Flexbox from '$lib/client/components/Flexbox.svelte';
	import Tooltip from '$lib/client/components/Tooltip.svelte';

	interface BaseProps {
		// Properties
		name?: string;
		type: T;
		label?: string;
		description?: string | null | Snippet;
		descriptionAsTooltip?: boolean;
		info?: string | null | Snippet;
		placeholder?: string | null | undefined;
		wrapperStyle?: string | null | undefined;
		required?: boolean;
		block?: boolean;
		readonly?: boolean;
        element?: Element;
		//Events
		onclick?: Function,
		onchange?: ChangeEventHandler<any> | null | undefined,
		onkeyup?: KeyboardEventHandler<any> | null | undefined,
		onkeydown?: KeyboardEventHandler<any> | null | undefined,
		onfocus?: FocusEventHandler<any> | null | undefined,

		//Snippets
		children?: Snippet<[any]>
	}

	type InputTypeProps =
		| ({ type: 'text' } & TextInputProps)
		| ({ type: 'number' } & NumberInputProps)
		| ({ type: 'select' } & SelectInputProps)
		| ({ type: 'tags' } & TagsInputProps)
		| ({ type: 'textarea' } & TextareaInputProps)
		| ({ type: 'checkbox' } & CheckboxInputProps)
		| ({ type: 'file' } & FileInputProps)
		| ({ type: string } & HTMLInputAttributes)

	type Props = BaseProps & InputTypeProps;

	let {
		// Properties
		name,
		type,
		value = $bindable(),
		element = $bindable(),
		label,
		description,
		descriptionAsTooltip = false,
		placeholder,
		wrapperStyle,
		required,
		readonly,
		block,

		// Events
		onclick,
		onchange,
		onkeyup,
		onkeydown,
		onfocus,

		children,

		...restProps
	}: Props = $props();
</script>

<div class="form-input" class:block style={wrapperStyle}>
	{#if label && type !== 'hidden' || description && descriptionAsTooltip}
		<Flexbox justify="space-between" style="margin-bottom: .25rem">
			{#if label && type !== 'hidden'}<label
				for="input-{name}">{label} {required && !readonly ? "(*)" : ""}</label>{/if}
			{#if description && descriptionAsTooltip}
				<Tooltip>
					<Icon icon="info-circle" />
					{#snippet text()}
						<span style="display: block; font-size: smalll; max-width: 250px; white-space: wrap">
							{#if typeof description === 'function'}
								{@render description()}
							{:else}
								{description}
							{/if}
						</span>
					{/snippet}
				</Tooltip>
			{/if}
		</Flexbox>
	{/if}

	{#if description && !descriptionAsTooltip}
		<div class="description">
			{#if typeof description === 'function'}
				{@render description()}
			{:else}
				{description}
			{/if}
		</div>
	{/if}

	{#if type === "text"}
		<TextInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
							 {onkeydown} {onfocus}
							 {children}
							 {...restProps} />
	{:else if type === "number"}
		<NumberInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
								 {onkeydown}
								 {onfocus}
								 {children}
								 {...restProps} />
	{:else if type === "select"}
		<SelectInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
								 {onkeydown}
								 {onfocus}
								 {children}
								 {...restProps} />
	{:else if type === "tags"}
		<TagsInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
							 {onkeydown} {onfocus}
							 {children}
							 {...restProps} />
	{:else if type === "textarea"}
		<TextareaInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
									 {onkeydown}
									 {onfocus}
									 {children}
									 {...restProps} />
	{:else if type === "checkbox"}
		<CheckboxInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
									 {onkeydown}
									 {onfocus}
									 {children}
									 {...restProps} />
	{:else if type === "file"}
		<div class="file-input-wrapper">
			<FileInput bind:element {name} bind:value={value} {placeholder} {required} {readonly} {onchange} {onkeyup}
								 {onkeydown} {onfocus}
								 {...restProps}>
			</FileInput>
			{@render children?.({ element })}
		</div>

	{:else}
		<input bind:this={element} class="form-control" {type} {name} bind:value={value} {placeholder} {required} {readonly}
					 {onchange}
					 {onkeyup}
					 {onkeydown} {onfocus} {...restProps} />
	{/if}

	{#if restProps.info}
		{#if typeof restProps.info === "function"}
			{@render restProps.info()}
		{:else}
			<p class="info">
				<Icon icon="info-circle" margin="right" />
				{restProps.info}
			</p>
		{/if}
	{/if}
</div>


<style lang="scss">
  @use 'sass:map';
  @use "$lib/client/styles/base/variables";
  @use "$lib/client/styles/mixins/input";

  .form-input {
    label {
      @include input.base_label;
    }

    .description {
      @include input.base_description;
      margin-bottom: 0.5rem;
    }

    .description-button-wrapper {
      position: relative;
      display: inline-block;
    }

    .description-button {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: color 0.2s ease;

      &:hover,
      &:focus {
        color: var(--color-text-primary);
      }

      &:focus {
        outline: 2px solid var(--color-border-focus, var(--color-border-primary));
        outline-offset: 2px;
        border-radius: 2px;
      }
    }

    .description-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      background-color: var(--color-background-primary);
      border: 1px solid var(--color-border-primary);
      color: var(--color-text-primary);
      padding: 0.5rem;
      border-radius: 4px;
      font-size: x-small;
      width: 250px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      white-space: nowrap;
      text-wrap: wrap;

      :global(a) {
        color: var(--color-primary);
      }

      &::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--color-border-primary);
      }

      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid var(--color-background-primary);
        margin-top: -1px;
      }
    }

    input {
      @include input.base_input;
    }

    &.block {
      display: block;
      width: 100%;
    }

    &:not(:last-child):not(:has(input[type="hidden"]:only-child)) {
      margin-bottom: var(--mb, map.get(variables.$spacings, "md"));
    }

    .info {
      margin-top: .5rem;
      margin-bottom: unset;
      font-size: 0.75rem;
      color: var(--color-text-secondary) !important;
    }

    .file-input-wrapper {
      display: flex;
      column-gap: .5rem;
      row-gap: .5rem;
      flex-wrap: wrap;

      :global(.drop-zone) {
        height: 100%;
      }
    }
  }
</style>
