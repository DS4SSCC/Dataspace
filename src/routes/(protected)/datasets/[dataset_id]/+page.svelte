<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import {getSectorFromThemeUriOrId} from "$lib/client/helpers/sector.helper";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import {marked} from "marked";
    import Property from "$lib/client/components/Property.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    let {data} = $props();

    const currentSector = $derived(getSectorFromThemeUriOrId(data.dataset?.theme as string));
</script>

<Page title={data.dataset?.title} breakpoints previous_label="Datasets" previous_href="/datasets">
    {#snippet description()}
        <Flexbox gap=".5rem">
            {#if currentSector}
                <SectorButton sector={currentSector} size="xs"/>
            {/if}
            <Button size="xs" variant={data.dataset?.is_published ? 'success' : 'secondary'}>
                {data.dataset?.is_published ? 'Published in DCAT-AP' : 'Not published'}
            </Button>
            <Button size="xs" variant={data.dataset?.policy_intent === 'PUBLIC' ? 'info' : 'warning'}>
                Policy Intent: {data.dataset?.policy_intent}
            </Button>
        </Flexbox>
    {/snippet}
    {#snippet suffix()}
        {#if data.dataset?.policy_intent === 'PUBLIC'}
            <Button href={data.dataset.download_url ?? ''}><Icon icon="download"/></Button>
        {/if}
    {/snippet}
    <Section>
        <Card>
            <div class="dataset-description">
                {@html marked(data.dataset?.description || '<em>No description available.</em>')}
            </div>
        </Card>
    </Section>
    <Section>
        <Card>
            <Property key="Imported" value={data.dataset?.imported_at.toLocaleString()}/>
            {#if data.dataset?.published_at}<Property key="Published" value={data.dataset?.published_at?.toLocaleString()}/>{/if}
        </Card>
    </Section>
    <pre>{JSON.stringify(data, null, 2)}</pre>
</Page>

<style>
    .dataset-description{
        :global(*){
            text-align: left !important;
            font-size: inherit !important;
        }
    }
</style>

