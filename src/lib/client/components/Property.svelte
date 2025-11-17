<script lang="ts">
	interface Props {
		key: string;
		value?: number | number[] | string | string[] | undefined;
		prefix?: import('svelte').Snippet;
		children?: import('svelte').Snippet<[any]>;
		suffix?: import('svelte').Snippet;
		style?: string;
		[key: string]: any
	}

	let {
		key,
		value = undefined,
		prefix,
		children,
		suffix,
		style,
		...rest
	}: Props = $props();
</script>

<span class="property{rest.class ? ` ${rest.class}` : ''}" {style}>
	{@render prefix?.()}
	<span class="key">{key}:&nbsp;</span>
	<span class="value">
		{#if typeof value === 'object'}
			{JSON.stringify(value, null, 2)}
		{:else}
			{#if children}
				{@render children({ value })}
			{:else}
				{value}
			{/if}
		{/if}
	</span>
	{@render suffix?.()}
</span>

<style lang="scss">
  @use "sass:map";
  @use "$lib/client/styles/base/variables" as variables;

  .property {
    width: 100%;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text, inherit);

    &:not(:global(:last-child)) {
      margin-bottom: map.get(variables.$spacings, "sm");
    }

    .key {
      font-weight: 700;
    }
  }
</style>
