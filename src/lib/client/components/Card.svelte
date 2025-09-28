<script lang="ts">
    import type {Snippet} from 'svelte';

    let {title, description, fit = false, prefix, header, children, onheaderclick, class: clzz, style,headerStyle, ...restProps}: {
        title?: string | Snippet,
        description?: string | Snippet,
        prefix?: Snippet,
        header?: Snippet,
        fit?: boolean,
        class?: string,
        style?: string,
        headerStyle?: string,
        children?: Snippet
        onheaderclick?: (event: MouseEvent) => void
        onclick?: (event: MouseEvent) => any
    } = $props();
</script>

<div class:fit role="presentation" class="card{clzz ? ` ${clzz}` : ''}" {style} {...restProps}>
    {@render prefix?.()}
    {#if title || description || header}
        <div class="card-header" onclick={onheaderclick} role="presentation" style={`${onheaderclick instanceof Function ? 'cursor: pointer;' : null}${headerStyle ? headerStyle : null}`}>
					<div class="header-content-wrapper">
						{#if title}
							<span class="title h3">
								{#if typeof title === 'function'}
									{@render title()}
								{:else}
									{title}
								{/if}
							</span>
						{/if}
						{#if description}
							<span class="description">
								{#if typeof description === 'function'}
									{@render description()}
								{:else}
									{description}
								{/if}
							</span>
						{/if}
					</div>
					{@render header?.()}
        </div>
    {/if}
    {@render children?.()}
</div>

<style lang="scss">
  @use "$lib/client/styles/mixins/responsive" as resp;
  @use "$lib/client/styles/base/variables";
  @use "sass:map";

  .card {
    border-radius: map.get(variables.$border-radii, "xl");
    background: var(--bg, var(--color-background-secondary));
    color: var(--text, var(--color-text-primary));
    border: var(--border, solid 1px var(--color-border-primary));
    background-position: center;
    background-size: cover;
    padding: map.get(variables.$spacings, "md");
    @include resp.min-width(md) {
      border-radius: map.get(variables.$border-radii, "xxl");
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      transition: .1s;
      margin-bottom: 0;
      user-select: none;
      flex: 1;

      .title {
        display: block;
        margin-top: 0 !important;
      }

      .description {
        display: block;
        color: var(--color-text-secondary);
			}
    }
    :global(.card .card-header:not(:last-child):not(:has(+ .collapse-wrapper))) {
      margin-bottom: map.get(variables.$spacings, "md");
    }
		:global(.card .card-header:has(+ .collapse-wrapper)){
      cursor: pointer;
    }

    &.fit {
      height: 100%;
    }
  }
</style>
