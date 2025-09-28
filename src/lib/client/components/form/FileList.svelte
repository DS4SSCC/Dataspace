<script lang="ts" module>
	export type BucketReference = { id: string, objectName: string, bucket: string, url: string }
</script>

<script lang="ts" generics="V extends (string | File | BucketReference)">
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import Button from '$lib/client/components/Button.svelte';
	import { fly, fade } from 'svelte/transition';
	import FilePreview from '$lib/client/components/form/FilePreview.svelte';
	import Flexbox from '$lib/client/components/Flexbox.svelte';

	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';

	interface FileListEvents {
		onremove?: (input: { index: number, file: V }) => unknown;
		onchange?: (input: { index: number, file: V, action: string, target?: HTMLInputElement }) => unknown;
	}

	interface Props {
		value?: V[];
		style?: string | undefined;
		target?: HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement | undefined;
		remove?: boolean;
		empty?: import('svelte').Snippet;
		preview?: Snippet<[typeof value[number], string, number]>;

		[key: string]: any;
	}

	let {
		value = $bindable([]),
		style = undefined,
		target = $bindable(undefined),
		remove = true,
		empty,
		onremove,
		onchange,
		preview,
		...rest
	}: Props & FileListEvents = $props();

	const getFileURL = (file: V): string => {
		if (!browser) return '';
		if (file instanceof File) {
			return URL.createObjectURL(file);
		} else if (typeof file === 'string') {
			if (file.startsWith('/') || !file.startsWith('http')) {
				return new URL(`${window.location.protocol}//${window.location.host}${file}`).toString();
			} else {
				return new URL(file).toString();
			}
		} else if (typeof file === 'object') {
			if (file.url.startsWith('/') || !file.url.startsWith('http')) {
				return new URL(`${window.location.protocol}//${window.location.host}${file.url}`).toString();
			} else {
				return new URL(file.url).toString();
			}
		}
		return '';
	};


	function removeFile(index: number, file: V) {
		value = value.filter((_, i) => i !== index);
		if (file instanceof File && target && target instanceof HTMLInputElement) {
			const dt = new DataTransfer();
			value.forEach(file => dt.items.add(file as File));
			target.files = dt.files;
			onchange?.({ index, file, action: 'remove', target });
			onremove?.({ index, file });
		} else {
			onchange?.({ index, file, action: 'remove' });
			onremove?.({ index, file });
		}
	}

	$effect.pre(() => {
		if (target && target instanceof HTMLInputElement) {
			target.addEventListener('change', () =>
				(value as any[]).push(...((target as HTMLInputElement)?.files ?? []))
			);
		}
	});

</script>

<div class="item-list{rest.class ? ` ${rest.class}` : ''}" {style}>
	{#each value as file, index (file)}
		{@const url = getFileURL(file)}
		<div class="item" out:fade={{duration: 150}} in:fly={{y:50}}>
			{#if preview}
				{@render preview(file, url, index)}
			{:else}
				<FilePreview style="height: 100%; border-radius: var(--border-radius, 12px);" src={url}
										 alt="uploaded file preview" />
				<Flexbox class="button-group" style="position: absolute;" columnGap=".25rem">
					<Button size="xs" onclick={() => {
								const _url = new URL(url);
								_url.searchParams.append('inline', 'true')
								window.open(_url)
						}
					}>
						<Icon icon="binoculars-fill" />
					</Button>
					<Button size="xs" onclick={() => window.open(url)}>
						<Icon icon="download" />
					</Button>
					{#if remove}
						<Button class="bg-danger" size="xs" onclick={() => removeFile(index,file)}>
							<Icon icon="trash" />
						</Button>
					{/if}
				</Flexbox>
			{/if}
		</div>
	{:else}
		{@render empty?.()}
	{/each}


</div>


<style lang="scss">
  @use "sass:map";
  @use "$lib/client/styles/base/variables" as variables;


  .item-list {
    display: inline-flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    row-gap: 1rem;

    .item {
      position: relative;
      height: var(--height, 120px);
      width: var(--height, 120px);
      aspect-ratio: 1/1;

      img {
        height: 100%;
        border-radius: map.get(variables.$border-radii, "md");
      }

      :global(.button-group) {
        position: absolute;
        left: .25rem;
        bottom: .25rem;
      }

      :global(.button-group button) {
        aspect-ratio: 1/1;
      }


      :global(.download-file-btn) {
        aspect-ratio: 1/1;
        position: absolute;
        right: 1.0rem;
        top: .5rem;
      }
    }

    :global(.file-upload-btn) {
      height: var(--height, 100px);
      border-radius: map.get(variables.$border-radii, "md");
      border: dashed 1px var(-primary-dark);
      flex-direction: column;
      row-gap: .5rem;
    }
  }


</style>
