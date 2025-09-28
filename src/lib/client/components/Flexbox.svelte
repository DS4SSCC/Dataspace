<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        justify?: "center" | "space-between" | "space-around" | "space-evenly" | "start" | "end" | "flex-start" | "flex-end" | null;
        align?: "center" | "space-between" | "space-around" | "space-evenly" | "start" | "end" | "flex-start" | "flex-end" | null;
        direction?: "row" | "row-reverse" | "column" | "column-reverse" | null;
        columnGap?: string | null;
        rowGap?: string | null;
        gap?: string | null;
        style?: string;
        fit?: boolean;
        inline?: boolean;
        type?: "div" | "section" | "span";
        children?: Snippet;
        [key: string]: any
    }

    let {
        justify = null,
        align = null,
        direction = null,
        columnGap = null,
        rowGap = null,
        gap = null,
        style = '',
        fit = false,
        inline = false,
        type = "div",
        onclick,
        children,
        ...rest
    }: Props = $props();

    // Create a derived style string that updates when props change
    let computedStyle = $derived.by(() => {
        let styleStr = style;

        // Ensure style ends with semicolon if it has content
        if (styleStr.length > 0 && !styleStr.endsWith(';')) {
            styleStr += ';';
        }

        // Add flexbox styles
        styleStr += `display: ${inline ? 'inline-' : ''}flex;`;
        if (align) styleStr += `align-items: ${align};`;
        if (justify) styleStr += `justify-content: ${justify};`;
        if (direction) styleStr += `flex-direction: ${direction};`;
        if (columnGap) styleStr += `column-gap: ${columnGap};`;
        if (rowGap) styleStr += `row-gap: ${rowGap};`;
        if (gap) styleStr += `gap: ${gap};`;
        if (fit) styleStr += "height: 100%; width: 100%;";

        return styleStr;
    });
</script>

<svelte:element
        this={type}
        class={rest.class ?? ''}
        style={computedStyle}
        {onclick}
        {...rest}
>
    {@render children?.()}
</svelte:element>
