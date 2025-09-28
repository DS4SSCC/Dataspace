<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Input from '$lib/client/components/form/Input.svelte';
	import Button from '$lib/client/components/Button.svelte';
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import { fade } from 'svelte/transition';
	import Form from '$lib/client/components/form/Form.svelte';

	interface Props {
		label?: string;
		type?: string;
		name?: string;
		styled?: boolean;
		value?: string[];
		disabled?: boolean;
		onchange?: (value: string[]) => unknown;
	}

	let {
		label = '',
		type = 'text',
		name,
		value = $bindable(),
		disabled = false,
		onchange
	}: Props = $props();

	onMount(() => {
		if (value === undefined || value === null) value = [];
	});


	async function addItem(val: File | string) {
		// Add a new item to the list
		if (typeof val === 'string' && val !== '') {
			value?.push(val);
			await tick(); // Update DOM before submitting
		}
	}

	async function removeItem(index: number) {
		// Remove an item from the list
		value = value?.filter((_, i) => i !== index);
		await tick(); // Update DOM before submitting
		onchange?.(value as string[]);
	}
</script>

<div class="input-list">
	<label>{label}
		<ul class="list-unstyled">
			{#if value}
				{#each value as _, i}
					<li class="item" in:fade>
						<Input {name} {type} style="flex:1; min-width: 50px;" bind:value={value[i]} />
						{#if (!disabled)}
							<Button transparent variant="danger" onclick={() => removeItem(i)}>
								<Icon icon="x-lg" />
							</Button>
						{/if}
					</li>
				{:else}
					<Input type="hidden" {name} value="[]" />
				{/each}
			{/if}
			{#if (!disabled)}
				<li class="input-item">
					<Form onsubmit={({form, formData}) => {
					addItem(formData.values().toArray()?.[0])
					form.reset();
					return false;
				}}>
						<Input {type} name="-" required />
						<Button variant="info" type="submit">
							<Icon icon="plus-lg" />
						</Button>
					</Form>
				</li>
			{/if}
		</ul>
	</label>
</div>

<style lang="scss">
  @use 'sass:map';
  @use "$lib/client/styles/base/variables" as variables;

  .input-list {
    label {
      font-weight: var(--font-weight-bold);
    }

    .item {
      :global(.form-input) {
        padding: 0.375rem 0.70rem !important;
      }
    }

    :global(.form-input) {
      margin-bottom: 0 !important;
    }

    li, form {
      display: flex;
      align-items: center;
      column-gap: map.get(variables.$spacings, "sm");

      &:not(:global(:last-child)) {
        margin-bottom: map.get(variables.$spacings, "md");
      }

      //
      //    :global(.form-control) {
      //      width: 100%;
      //    }
      //
      //    :global(.form-input) {
      //      flex: 1;
      //      min-width: 50px;
      //    }
    }
  }
</style>
