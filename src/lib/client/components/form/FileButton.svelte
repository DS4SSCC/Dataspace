<script lang="ts" module>
	type CustomFile = {
		id: string;
		name: string;
		src: string;
	}


	export const onview = (file: CustomFile | File) => {
		let url: URL;
		if (file instanceof File) {
			url = new URL(URL.createObjectURL(file));
		} else {
			if (file.src.startsWith('/') || !file.src.startsWith('http')) {
				url = new URL(`${window.location.protocol}//${window.location.host}${file.src}`);
			} else {
				url = new URL(file.src);
			}
			if (!url.searchParams.has('inline')) {
				url.searchParams.append('inline', 'true');
			}
		}
		return window.open(url, '_blank'); // Open in new tab
	};


	export const ondownload = (file: CustomFile | File) => {
		let url: string;

		if (file instanceof File) {
			// For File objects (e.g. from input or drag-drop)
			url = URL.createObjectURL(file);

			// Create a temporary anchor to trigger download
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name || 'download'; // Use file name or fallback
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			// Clean up the object URL after a short delay
			setTimeout(() => URL.revokeObjectURL(url), 100);
		} else {
			// For CustomFile with src (remote or local path)
			url = file.src.startsWith('http') ? file.src : `${window.location.origin}${file.src}`;

			// Create a URL with no 'inline' param to encourage download
			const downloadUrl = new URL(url);
			if (downloadUrl.searchParams.has('inline')) {
				downloadUrl.searchParams.delete('inline');
			}

			// Trigger download using anchor click
			const a = document.createElement('a');
			a.href = downloadUrl.toString();
			a.download = file.name || 'download'; // Use file.name or fallback
			a.target = '_blank'; // Optional: ensure it opens in context
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	};

</script>
<script lang="ts" generics="T extends File | CustomFile">
	import Button from '$lib/client/components/Button.svelte';
	import Image from '$lib/client/components/Image.svelte';
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import Dropdown from '$lib/client/components/Dropdown.svelte';
	import Icon from '$lib/client/components/icons/Icon.svelte';

	let { file, loading, variant = 'compact', onclick, onview, ondownload, onremove }: {
		file: T,
		loading?: boolean
		icon?: string
		variant?: 'compact' | 'square'
		onclick?: (file: T) => void
		onview?: (file: T) => void
		ondownload?: (file: T) => void
		onremove?: (file: T) => void
	} = $props();

	// State for file info
	let fileInfo = $state({
		extension: undefined as string | undefined,
		isImage: false,
		previewUrl: undefined as string | undefined,
		name: file.name
	});

	// Track blob URL for cleanup
	let blobUrl: string | undefined = $state();

	// Effect to handle side effects and updates
	$effect(() => {
		const parts = file.name.split('.');
		const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;

		const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'];
		const isImage = extension ? imageExtensions.includes(extension) : false;

		let previewUrl: string | undefined;

		if (isImage && browser) {
			if (file instanceof File || file instanceof Blob) {
				// Clean up previous blob URL if exists
				if (blobUrl) {
					URL.revokeObjectURL(blobUrl);
				}
				// Create new blob URL
				blobUrl = URL.createObjectURL(file);
				previewUrl = blobUrl;
			} else if (file.src) {
				if (file.src.startsWith('http')) {
					previewUrl = file.src;
				} else {
					// Normalize relative URLs
					const { protocol, host } = window.location;
					previewUrl = `${protocol}//${host}${file.src.startsWith('/') ? '' : '/'}${file.src}`;
				}
			}
		}

		// Update the state
		fileInfo = {
			extension,
			isImage,
			previewUrl,
			name: file.name
		};
	});

	// Clean up blob URL when component is destroyed
	onDestroy(() => {
		if (blobUrl) {
			URL.revokeObjectURL(blobUrl);
		}
	});
</script>

<Button class="file-btn {variant}" {onclick}>
	{#if loading}
		<span class="loader"></span>
	{/if}
	{#if fileInfo.isImage && fileInfo.previewUrl}
		<Image class="image-preview" src={fileInfo.previewUrl} alt={fileInfo.name} />
	{:else}
		<Icon class="filetype-icon" icon="filetype-{fileInfo.extension}" fallback="file-earmark" />
	{/if}
	<span class="file-name">{fileInfo.name}</span>
	{#if onview || onremove || ondownload}
		<Dropdown transparent class="action-dropdown">
			{#snippet menu()}
				<span class="dropdown-file-name">{fileInfo.name}</span>
				{#if onview}
					<Button transparent onclick={()=> onview(file)}>
						<Icon icon="eye-fill" margin="right" />
						View
					</Button>
				{/if}
				{#if ondownload}
					<Button transparent onclick={()=> ondownload(file)}>
						<Icon icon="download" margin="right" />
						Download
					</Button>
				{/if}
				{#if onremove}
					<Button --text="var(--color-danger)" transparent onclick={()=> onremove(file)}>
						<Icon icon="trash-fill" margin="right" />
						Remove
					</Button>
				{/if}
			{/snippet}
		</Dropdown>
	{/if}
</Button>

<style lang="scss">
  :global(.file-btn) {
    position: relative;
    background: var(--color-background-primary) !important;
    box-sizing: border-box;

    .file-name {
      display: block;
      font-size: small;
      white-space: nowrap;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-file-name {
      font-size: small;
      color: var(--color-text-secondary);
      max-width: 150px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      text-align: left;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      border-bottom: solid 1px var(--color-border-primary);
      padding-bottom: .5rem;
      margin-bottom: .5rem;
    }
  }

  :global(.file-btn.square) {
    height: var(--size, 100px);
    width: var(--size, 100px);
    aspect-ratio: 1/1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .file-name {
      display: none;
    }

    :global(.image-preview) {
      position: absolute;
      width: 100%;
      height: 100%;
      font-size: xx-large;
    }

    :global(.filetype-icon) {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: xx-large;
      color: var(--color-text-secondary);
    }

    :global(.action-dropdown) {
      position: absolute;
      top: 0;
      right: 0;
    }
  }

  :global(.file-btn.compact) {
    height: var(--height, 50px);
    width: var(--width, 100%);
    max-width: var(--max-width);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: .5rem !important;
    overflow: hidden;


    .loader {
      position: absolute;
      left: .5rem;
      top: .5rem;
      border: solid 3px transparent;
      border-top: solid 3px var(--color-primary);
      height: calc(var(--height, 50px) - 1rem);
      width: calc(var(--height, 50px) - 1rem);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }

    .file-name {
      position: absolute;
      left: calc(var(--height, 50px));
      width: calc(100% - var(--height, 50px) * 2);
      text-align: left;
    }

    :global(.image-preview) {
      font-size: medium;
      height: calc(var(--height, 50px) - 1rem);
      width: calc(var(--height, 50px) - 1rem);
      border-radius: calc(.75rem - .5rem);
    }

    :global(.filetype-icon) {
      display: block !important;
      font-size: medium;
      width: calc(var(--height, 50px) - 1rem);
    }
  }
</style>
