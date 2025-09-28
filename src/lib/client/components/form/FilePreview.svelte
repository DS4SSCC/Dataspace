<script lang="ts">

	import { onMount } from 'svelte';
	import Image from '$lib/client/components/Image.svelte';
	import Icon from '$lib/client/components/icons/Icon.svelte';

	interface Props {
		src?: string | File | undefined | null;
		alt?: string | undefined;
		children?: import('svelte').Snippet<[any]>;
		icon?: import('svelte').Snippet<[any]>;
		hide_file_name?: boolean;

		[key: string]: any;
	}

	let {
		src = $bindable(undefined),
		alt = undefined,
		children,
		icon,
		hide_file_name = true,
		...rest
	}: Props = $props();

	const getType = async (url: string | undefined | null) => {
		if (!url) return undefined;
		if (url.startsWith('/') || !url.startsWith('http')) {
			url = `${window.location.protocol}//${window.location.host}${url}`;
		}
		file_inline_url = new URL(url);
		file_inline_url.searchParams.append('inline', 'true');
		return fetch(file_inline_url, { method: 'HEAD' }).then((res) => res.headers.get('content-type') ?? undefined, () => undefined);
	};

	let mime: string | undefined = $state(undefined);
	let url: string | undefined = $state(undefined);
	let file_inline_url = $state<URL>();

	onMount(async () => {
		mime = src instanceof File ? src.type : await getType(src);
		if (src instanceof File) src = URL.createObjectURL(src);
		url = src as string | undefined;
	});

	const urlDecoder = (url: string | undefined) => {
		if (!url) return { objectName: null, bucket: null };
		try {
			const searchParams = new URLSearchParams(url.substring(url.indexOf('?') + 1));
			return {
				objectName: searchParams.get('objectName'),
				bucket: searchParams.get('bucket')
			};
		} catch (e) {
			return { objectName: null, bucket: null };
		}
	};

	let filename: string | undefined = $state(undefined);
	let fileExtension: string | undefined = $state(undefined);

	$effect.pre(() => {
		const array = urlDecoder(url).objectName?.split('/');
		filename = array?.[array?.length - 1];
		fileExtension = filename?.split('.')?.pop();
	});

</script>

<div class="file-preview">
	{#if children}
		{@render children({ url, mime, filename, fileExtension })}
	{:else}
		{#if mime?.startsWith("image")}
			<Image src={file_inline_url} {alt} {...rest} />
		{:else}
			{#if icon}
				{@render icon({ url, mime, filename, fileExtension })}
			{:else}
				<Icon style="font-size: xx-large" icon="filetype-{fileExtension}" />
			{/if}
		{/if}
		{#if !hide_file_name}
			<p class="file-name" title={filename}>{filename}</p>
		{/if}

	{/if}
</div>

<style lang="scss">
  .fallback {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: var(--font-size-h1);
    color: var(--color-text-secondary);
  }

  .file-preview {
    height: var(--height, 100%);
    min-width: 100px;
    background: var(--color-background-tertiary);
    border-radius: var(--border-radius, 12px);
    border: solid 1px var(--color-border-primary, silver);
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-secondary);
    overflow: hidden;

    :global(img) {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }


    .file-name {
      display: block;
      font-size: small;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

    }

  }
</style>
