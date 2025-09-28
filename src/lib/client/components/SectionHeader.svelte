<script lang="ts">
import type {Snippet} from "svelte";
import Flexbox from "$lib/client/components/Flexbox.svelte";

let {title, description, prefix, suffix, style, onclick}: {
    title?: string,
    description?: string,
    prefix?: Snippet,
    suffix?: Snippet,
    style?: string,
    onclick?: ()=> void,
} = $props();
</script>

<Flexbox columnGap="1rem" justify="space-between" align="center" class="section-header"
				 style="margin-bottom: 2rem;{onclick ? 'cursor: pointer;' : ''}{style ? ` ${style}` : ''}"
				 role={onclick ? 'presentation' : null}
				 {onclick}>
    <Flexbox align="center">
        {@render prefix?.()}
        <div>
            <h3 class="" style="margin-bottom: 0">{title}</h3>
            {#if description}<p style="color: var(--color-text-secondary)">{description}</p>{/if}
        </div>
    </Flexbox>

    {@render suffix?.()}
</Flexbox>
