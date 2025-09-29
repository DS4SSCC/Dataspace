<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";

    let { data } = $props();
</script>
<Page>
    <pre><code>{JSON.stringify(data, null, 2)}</code></pre>
</Page>

