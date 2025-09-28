<script lang="ts">
    import Button from "$lib/client/components/Button.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import {getContext} from "svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Tooltip from "$lib/client/components/Tooltip.svelte";

    let {dataset, fit}: {
        dataset: any,
        fit?: boolean
    } = $props();

    // sectors context
    const sectors = getContext<{ id: string, name: string, description: string }[]>("sectors");

    // in DCAT this is `dcat:theme`, not sector_id
    const currentSector = $derived(sectors?.find((s) => s.id === dataset["dcat:theme"]));
</script>

<Card fit style="display: flex; flex-direction: column; justify-content: space-between">
    <div>
        <Flexbox justify="space-between" align="center" gap=".5rem" style="margin-bottom: 1rem">
            <SectorButton sector={currentSector} size="xs"/>
            <!-- DCAT uses dct:modified -->
            <span style="font-size: small; color: var(--color-text-secondary)">{dataset["dct:modified"]}</span>
        </Flexbox>

        <div>
            <!-- dct:title -->
            <h3>{dataset["dct:title"]}</h3>
            <!-- dct:description -->
            <p style="color: var(--color-text-secondary)">{dataset["dct:description"]}</p>
        </div>
    </div>


    <Flexbox justify="flex-end" align="center" style="margin-top: 1rem;">
        <!-- dcat:keyword -->
        <!--{#if dataset["dcat:keyword"]}-->
        <!--    <div style="display: flex; flex-wrap: wrap; gap: .5rem">-->
        <!--        {#each dataset["dcat:keyword"] as tag}-->
        <!--            <Button size="xs">{tag}</Button>-->
        <!--        {/each}-->
        <!--    </div>-->
        <!--{/if}-->

        {#if dataset["dct:publisher"]}
            <Tooltip text={dataset["dct:publisher"]['foaf:name']}>
                <img src="/publishers/{dataset['dct:publisher']['@id']}/logo.svg" height="20px"/>
            </Tooltip>
        {/if}
    </Flexbox>
</Card>
