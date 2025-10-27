<script lang="ts">
    import Card from "$lib/client/components/Card.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Tooltip from "$lib/client/components/Tooltip.svelte";

    let {catalog, onclick}:{
        catalog: any;
        onclick?: (e: any) => void;
    } = $props();
</script>

<Card fit style="display: flex; flex-direction: column; justify-content: space-between;{onclick ? 'cursor: pointer;': null}" {onclick}>
    <div>
        <Flexbox justify="space-between" align="flex-start">
            <h4>{catalog.title}</h4>
            <Button size="xs" variant={catalog.isActive ? 'success' : 'danger'}>{catalog.isActive ? 'Active' : 'Inactive'}</Button>
        </Flexbox>
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem">{catalog.description}</p>
    </div>
    <Flexbox gap=".5rem">
        <Button size="xs" variant="primary"><Icon icon="globe" margin="right"/>{catalog.apiUrl}</Button>
        <Button size="xs">{catalog.apiStandard}</Button>
    </Flexbox>
</Card>
