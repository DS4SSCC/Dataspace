<script lang="ts">
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import type { Snippet } from 'svelte';

	let {
		src = $bindable(undefined),
		style = undefined,
		alt = '',
		fallback,
		fallback_icon = 'image',
		fallback_src,
		class: className = '',
		onerror,
		...restProps
	}: {
		src?: string | undefined | null | URL;
		style?: string | undefined;
		alt?: string;
		fallback?: Snippet;
		fallback_icon?: string;
		fallback_src?: string;
		class?: string;
		onerror?: (input: { element: HTMLImageElement | undefined, src: string | undefined | null }) => void;
		[key: string]: any;
	} = $props();


	let element = $state<HTMLImageElement>();

</script>

{#if src}
	<img
		bind:this={element}
		class="image {className ?? ''}"
		{src}
		{alt}
		{style}
		{...restProps}
		onerror={() => { onerror?.({element,src})
			src = fallback_src ?? undefined;
		}}
	>
{:else}
	{#if fallback}
		{@render fallback()}
	{:else if !fallback_src}
		<div class="fallback {className ?? ''}" {style}>
			<Icon icon={fallback_icon} />
		</div>
	{/if}
{/if}

<style lang="scss">
  @use "sass:map";
  @use "$lib/client/styles/base/variables" as variables;

  .fallback {
    display: flex !important;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: inherit;
    color: var(--color-text-secondary);
    background: var(--bg);
  }

  .image, .fallback {
    width: var(--width, auto);
    height: var(--height, auto);
    aspect-ratio: var(--aspect-ratio, unset);
    object-fit: var(--object-fit, contain);
    background: var(--bg);
  }
</style>
