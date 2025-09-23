<script lang="ts">

    import type {Snippet} from "svelte";
    import type {SubmitFunction} from "@sveltejs/kit";

    const {url, children, onsubmit}: { url: string | URL, children: Snippet, onsubmit: SubmitFunction } = $props();

</script>
<form onsubmit={onsubmit}>
    {@render children?.()}
</form>
