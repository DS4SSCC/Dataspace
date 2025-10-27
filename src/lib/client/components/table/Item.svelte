<script lang="ts">
    import type {Snippet} from "svelte";
    import type {Sized} from "$lib/client-lib/helpers/sizes.helper";

    type ItemType = 'row' | 'data' | 'header' | 'none';

    let {data, type = 'data', onclick, children, class: clzz, style, id, colspan, xs, sm, md, lg, xl, xxl, ...restProps}: {
        data?: object | string,
        type?: ItemType,
        onclick?: (event: MouseEvent) => unknown;
        class?: string,
        children?: Snippet,
        style?: string,
        id?: string | number,
        colspan?: number | string,
        xs?: "none" | "show",
        sm?: "none" | "show",
        md?: "none" | "show",
        lg?: "none" | "show",
        xl?: "none" | "show",
        xxl?: "none" | "show",
    } & Partial<Sized> = $props();

    const elementType = $derived.by(() => {
        if (type === 'row') return 'tr';
        if (type === 'data') return 'td';
        if (type === 'header') return 'th';
        if (type === 'none') return 'div';
        return 'div';
    });

    // ✅ Handle visibility classes with $derived
    const visibilityClasses = $derived.by(() => {
        let classes: string[] = [];

        // Handle visibility classes
        if (xs === "none") {
            classes.push('d-xs-none');
        }
        if (sm === "none") {
            classes.push('d-sm-none');
        }
        if (md === "none") {
            classes.push('d-md-none');
        }
        if (lg === "none") {
            classes.push('d-lg-none');
        }
        if (xl === "none") {
            classes.push('d-xl-none');
        }
        if (xxl === "none") {
            classes.push('d-xxl-none');
        }

        if (xs === "show") {
            classes.push('d-xs-table-cell');
        }
        if (sm === "show") {
            classes.push('d-sm-table-cell');
        }
        if (md === "show") {
            classes.push('d-md-table-cell');
        }
        if (lg === "show") {
            classes.push('d-lg-table-cell');
        }
        if (xl === "show") {
            classes.push('d-xl-table-cell');
        }
        if (xxl === "show") {
            classes.push('d-xxl-table-cell');
        }

        return classes.join(' ');
    });

    // ✅ Combine all classes
    const combinedClasses = $derived.by(() => {
        const classes = [clzz, visibilityClasses].filter(Boolean);
        return classes.join(' ');
    });

    // ✅ Zorg dat colspan een geldige waarde is
    const validColspan = $derived.by(() => {
        if (colspan === undefined) return undefined;
        const num = Number(colspan);
        return isNaN(num) ? colspan : num;
    });
</script>

<svelte:element
        this={elementType}
        id={id?.toString()}
        class={combinedClasses}
        {onclick}
        role="presentation"
        {style}
        colspan={validColspan}
        {...restProps}
>
    {#if children}
        {@render children()}
    {:else}
        {data?.toString() ?? ''}
    {/if}
</svelte:element>

<style lang="scss">
  :global(tr.indent td:first-child) {
    padding-left: 24px;
  }

  :global(tr,td,th a) {
    --text: var(--color-text-primary);
  }
  :global(tr:not(:last-child)){
    border-bottom: solid 1px var(--color-border-primary);
  }
</style>
