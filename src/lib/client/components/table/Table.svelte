<script lang="ts">
    import Item from './Item.svelte';
    import type {Snippet} from "svelte";


    interface Props {
        columns?: (string | { name: string; property?: string })[];
        rows?: (object | string)[];
        style?: string;
        wrapperStyle?: string;
        head?: Snippet;
        children?: Snippet;
    }

    let {
        columns = [],
        rows = [],
        style,
        wrapperStyle,
        head,
        children
    }: Props = $props();

    let container: HTMLDivElement | null = null;
    let scrollable = $state(false);

    $effect(() => {
        if (!container) return;

        const checkScrollable = () => {
            scrollable = container!.scrollHeight > container!.clientHeight;
        };

        // Initial check
        checkScrollable();

        // Re-check on resize
        const resizeObserver = new ResizeObserver(checkScrollable);
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    });
</script>

<div class="table" bind:this={container} class:scrollable={scrollable} style={wrapperStyle}>
    <table class="table" {style}>
        <thead>
        {#if columns.length > 0}
            <Item type="row">
                {#each columns as column}
                    {#if typeof column === 'string'}
                        <Item type="header">{column}</Item>
                    {:else}
                        <Item type="header">{column.name}</Item>
                    {/if}
                {/each}
            </Item>
            {@render head?.()}
        {:else}
            {@render head?.()}
        {/if}
        </thead>

        <tbody>
        {#if rows.length > 0}
            {#each rows as row}
                <Item type="row">
                    {#each columns as column}
                        {#if typeof column === 'string'}
                            <Item>{row[column]}</Item>
                        {:else}
                            <Item>{column.name}</Item>
                        {/if}
                    {/each}
                </Item>
            {/each}
            {@render children?.()}
        {:else}
            {@render children?.()}
        {/if}
        </tbody>
    </table>
</div>


<style lang="scss">
  @use "$lib/client/styles/mixins/hover-scrollbar" as sb;
  .table {
    @include sb.scrollbar();
    table {
      border-color: var(--color-border-primary);
      vertical-align: top;
      width: 100%;
      overflow-x: auto;
      caption-side: bottom;
      border-collapse: collapse;
      text-align: left;
			background: var(--bg, transparent);

      & > thead {
        vertical-align: bottom;
        position: sticky;
        top: 0;
        background: var(--bg-header, transparentize);
        z-index: 1;
        // Move the border here to make it sticky
        box-shadow: 0 1px 0 0 var(--color-border-primary);
      }

      & > tbody {
        vertical-align: inherit;
      }

      :global(th) {
        text-align: inherit;
        text-align: -webkit-match-parent;
        // Remove the border from th elements
        border-bottom: none;
      }
    }

    /* Apply max-height and enable scrolling */
    &:has(table) {
      position: relative;
      max-height: var(--max-height);
      overflow-y: auto;
      &.scrollable::after {
        content: '';
        position: sticky;
        bottom: 0;
        height: 20px;
        width: 100%;
        background: linear-gradient(to top, var(--bg), transparent);
        display: block;
        margin-top: -20px; // Adjust to position correctly
      }
    }
  }

  :global(table tbody, td, tfoot, th, thead, tr) {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
  }

  :global(table > :not(caption) > *:not(:global(:last-child)) > *) {
    border-bottom: 1px solid var(--color-border-primary);
  }

  :global(table > :not(caption) > * > *) {
    padding: .5rem .5rem;
    vertical-align: middle;
  }
</style>
