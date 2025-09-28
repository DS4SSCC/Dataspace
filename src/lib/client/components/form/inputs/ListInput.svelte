<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Button from '$lib/client/components/Button.svelte';
	import Flexbox from '$lib/client/components/Flexbox.svelte';
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import { fade, fly } from 'svelte/transition';
	import Input from '$lib/client/components/form/Input.svelte';

	let { label, name, description, info, required, style, readonly, placeholder, type, value = $bindable(), allow_save = true, onchange }:
		{
			label?: string,
			name: string,
			info?: string,
			description?: string,
			style?: string,
			required?: boolean,
			readonly?: boolean,
			type: 'text' | 'number' | 'email' | 'password' | 'url' | 'tel',
			placeholder?: string,
			value?: any[],
			onchange?: any,
			allow_save?: boolean
		} = $props();

	let inputValue = $state();
	let startValue: any[] | undefined;
	onMount(() => {
		startValue = value;
	});

	async function addItem<T>(item: T, event: any | null = null): Promise<void> {
		if (event) {
			event.preventDefault();
		}
		// Add a new item to the list
		if (item !== undefined && item !== null) {
			if (!value?.some((existingItem) => existingItem === item)) {
				value = [...(value || []), item]; // Create a new array with the added item
				await tick(); // Update DOM before submitting
				onchange?.(value); // Trigger onchange with updated value
				inputValue = '';
			} else {
				console.warn('Duplicate item:', item);
			}
		}
	}

	async function removeItem(index: number) {
		// Remove an item from the list
		if (value && index >= 0 && index < value.length) {
			value = value.filter((_, i) => i !== index); // Create a new array without the removed item
			await tick(); // Update DOM before submitting
			onchange?.(value); // Trigger onchange with updated value
		} else {
			console.warn('Invalid index:', index);
		}
	}
</script>

<div class="list-input" {style}>
	<Flexbox columnGap=".5rem" align="flex-end">
		<Input class="form-control" {placeholder} bind:value={inputValue} {type} {label} {description} {info} {required} {readonly} --mb="0" wrapperStyle="flex: 1"
					 onkeydown={(event)=>{event.key === "Enter" ? addItem(inputValue, event) : null}} />
		{#if inputValue}
			<Button variant="primary"
							onclick={()=> addItem(inputValue)}>Add
				<Icon icon="plus-lg" margin="left" />
			</Button>
		{/if}
		{#if JSON.stringify(startValue) !== JSON.stringify(value) && allow_save}
			<Button variant="success" type="submit">Save
				<Icon icon="floppy-fill" margin="left" />
			</Button>
		{/if}
	</Flexbox>
	{#if value}
		<div class="list">
			{#each value as entry, i}
				<div in:fade out:fly={{x:50}}>
					<Flexbox align="center">
						<Button transparent variant="danger" onclick={()=> removeItem(i)}>
							<Icon icon="dash-circle" margin="right" />
						</Button>
						<span class="list-item">{entry}</span>
						<input type="hidden" {name} value={entry} />
					</Flexbox>
				</div>
			{:else}
				<input type="hidden" {name} value="[]" />
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
  @use 'sass:map';
  @use "$lib/client/styles/base/variables";
  @use "$lib/client/styles/mixins/input";

  .list-input {
    overflow: hidden;
    width: 100%;

    .list {
      max-height: 200px;
      overflow-y: auto;
      margin-top: .25rem;

      .list-item {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

  }
</style>
