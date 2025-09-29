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
        <h3>{catalog.title}</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem">{catalog.description}</p>
    </div>
    <Flexbox gap="1rem">
        <Tooltip text={catalog.apiStandard}>
            <Button size="xs" variant="primary"><Icon icon="globe" margin="right"/>{catalog.apiUrl}</Button>
        </Tooltip>
    </Flexbox>
</Card>
