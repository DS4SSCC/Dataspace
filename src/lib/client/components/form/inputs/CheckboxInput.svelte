<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { type Snippet } from 'svelte';

	export interface Props {
		name?: string;
		required?: boolean;
		readonly?: boolean;
		value?: boolean;
		element?: HTMLInputElement;
		variant?: 'slider' | 'checkbox';
		children?: Snippet;
		onchange?: (event: Event) => void;
	}

	let {
		name,
		required = false,
		readonly = false,
		value = $bindable(),
		element = $bindable(),
		variant = 'slider',
		children,
		...restProps
	}: Props & HTMLInputAttributes = $props();
</script>

<label
	class="input-container"
	class:slider-variant={variant === 'slider'}
	class:checkbox-variant={variant === 'checkbox'}
>
	<input
		id="input-{name}"
		type="checkbox"
		{readonly}
		{required}
		bind:checked={value}
		bind:this={element}
		{...restProps}
	/>

	{#if name}
		<input type="hidden" {name} value={JSON.stringify(value)} />
	{/if}

	{#if variant === 'slider'}
		<span class="slider" class:checked={value}></span>
	{:else if variant === 'checkbox'}
		<span class="checkmark" class:checked={value}></span>
	{/if}

	{#if children}
		<span class="label-text">
			{@render children()}
		</span>
	{/if}
</label>

<style lang="scss">
  @use 'sass:map';
  @use '$lib/client/styles/base/variables';
  @use '$lib/client/styles/mixins/input';

  .input-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }

    .label-text {
      margin-left: 8px;
      user-select: none;
    }
  }

  /* Slider variant styles */
  .slider-variant {
    width: 50px;
    height: 24px;

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 24px;

      &::before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }

      &.checked {
        background-color: var(--color-primary);

        &::before {
          transform: translateX(26px);
        }
      }

      &:global(.disabled) {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }
  }

  /* Checkbox variant styles */
  .checkbox-variant {
    .checkmark {
      position: relative;
      height: 20px;
      width: 20px;
      background-color: var(--color-background-primary);
      border: 2px solid var(--color-text-primary);
      border-radius: 3px;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        border-color: var(--color-primary, #007bff);
      }

      &::after {
        content: '';
        position: absolute;
        display: none;
        left: 6px;
        top: 2px;
        width: 6px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      &.checked {
        background-color: var(--color-primary);
        border-color: var(--color-primary);

        &::after {
          display: block;
        }
      }

      &:global(.disabled) {
        background-color: #f0f0f0;
        border-color: #ccc;
        cursor: not-allowed;
      }

      &:global(.disabled.checked) {
        background-color: #ccc;
      }
    }
  }

  /* Focus styles for accessibility */
  .input-container input:focus-visible + .slider,
  .input-container input:focus-visible + .checkmark {
    outline: 2px solid var(--color-primary, #007bff);
    outline-offset: 2px;
  }
</style>
