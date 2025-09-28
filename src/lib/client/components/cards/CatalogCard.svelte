<script lang="ts">
    import Card from "$lib/client/components/Card.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    let {catalog} = $props();
</script>

<Card fit style="display: flex; flex-direction: column; justify-content: space-between;">
    <div>
        <h3>{catalog["dct:title"]}</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem">{catalog["dct:description"]}</p>
    </div>
    <Flexbox gap="1rem">
        <Button size="xs"><Icon icon="database" margin="right"/>{catalog["dcat:dataset"]?.length}</Button>
    </Flexbox>
</Card>
