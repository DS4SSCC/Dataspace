<script lang="ts">
    import Button from "$lib/client/components/Button.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import {getContext} from "svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Tooltip from "$lib/client/components/Tooltip.svelte";
    import {getSectorFromThemeUriOrId} from "$lib/client/helpers/sector.helper";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import {marked} from "marked";

    // Gebruik het nieuwe type voor de dataset
    // dataset is nu optioneel
    let {dataset, fit, skeleton = false, imported = 0, importable, onimport, onclick}: {
        dataset?: {
            id: string;
            title: string;
            description: string;
            issued?: string; // ISO 8601 date
            modified?: string; // ISO 8601 date
            catalogId?: string;
            publisher: {
                id: string;
                name: string;
            };
            themes: string[]; // URIs
            theme: string; // URIs
            keywords: string[];
            distributions: {
                id: string;
                title: string;
                description: string;
                accessUrl: string;
                downloadUrl?: string;
                mediaType: string;
                format?: string;
                byteSize?: number;
            }[];
            landingPage?: string;
            contactPoint?: string;
        },
        fit?: boolean,
        skeleton?: boolean,
        importable?: boolean,
        imported?: 0 | 1 | 2,
        onimport?: () => void
        onclick?: () => void
    } = $props();

    const catalogs = getContext<{ id: string, name: string, description: string }[]>("catalogs");
    const currentSector = $derived.by(() => {
        if (skeleton || !dataset) return undefined; // Geen sector als skeleton of geen dataset

        try {
            if (Array.isArray(dataset.themes)) return getSectorFromThemeUriOrId(dataset.themes[0]);
            if (dataset.theme) return getSectorFromThemeUriOrId(dataset.theme);
        } catch (err) {
            return undefined;
        }
    });
    const catalog = $derived.by(()=> catalogs.find(catalog => catalog.id === dataset?.catalogId));

    // Bepaal of de skeleton mode actief is
    const isSkeleton = $derived(skeleton || !dataset);
</script>

<Card {fit} style="display: flex; flex-direction: column; justify-content: space-between">
    {#if isSkeleton}
        <!-- Skeleton Content -->
        <div>
            <Flexbox justify="space-between" align="center" gap=".5rem" style="margin-bottom: 1rem">
                <!-- Placeholder voor SectorButton -->
                <div style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 60px; height: 20px; border-radius: 4px;"></div>
                {#if importable}
                    <!-- Placeholder voor imported badge -->
                    <div style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 50px; height: 14px; border-radius: 2px;"></div>
                {/if}
            </Flexbox>

            <div>
                <!-- Placeholder voor titel -->
                <h3 style="margin: 0; padding: 0;">
                    <span style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 80%; height: 24px; border-radius: 4px;"></span>
                </h3>
                <!-- Placeholder voor beschrijving -->
                <p style="color: transparent; margin: 0.5rem 0 0 0; line-height: 1.4; user-select: none;">
                    <span style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 100%; height: 12px; border-radius: 2px; margin-bottom: 4px;"></span>
                    <span style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 70%; height: 12px; border-radius: 2px;"></span>
                </p>
            </div>
        </div>

        <Flexbox justify="space-between" align="center" style="margin-top: 1rem;">
            <!-- Placeholder voor button -->
            <div style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 100px; height: 24px; border-radius: 4px;"></div>
            <!-- Placeholder voor publisher tooltip/logo -->
            <div style="display: flex; align-items: center; gap: 0.25rem;">
                <div style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 20px; height: 20px; border-radius: 50%;"></div>
                <div style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 40px; height: 14px; border-radius: 2px;"></div>
            </div>
        </Flexbox>
    {:else}
        <!-- Actual Content -->
        <div>
            <Flexbox justify="space-between" align="center" gap=".5rem" style="margin-bottom: 1rem">
                {#if currentSector}
                    <SectorButton sector={currentSector} size="xs"/>
                {/if}
                {#if importable}
                    {#if imported === 1}
                        <Button size="xs" variant="success">
                            <Icon icon="check-lg" margin="right"/>
                            Imported
                        </Button>
                    {:else if imported === 2}
                        <Button size="xs" variant="warning">
                            Importing...
                        </Button>
                    {:else}
                        <Button size="xs" onclick={onimport}>
                            <Icon icon="arrow-down-square" margin="right"/>
                            Import
                        </Button>
                    {/if}
                {/if}
            </Flexbox>

            <div role="presentation" {onclick} style:cursor={onclick ? 'pointer' : 'auto'}>
                <h4>{dataset.title}</h4>
                <div class="description">
                    {@html marked(dataset.description || '<em>No description available.</em>')}
                </div>
            </div>
        </div>
        {#if catalog}
            <Flexbox justify="flex-end" align="center" style="margin-top: 1rem;">
                {#if catalog.name}
                    <Tooltip text={catalog.title}>
                        <img
                                src={catalog.logoUrl}
                                height="20px"
                                alt="Logo van {catalog.title}"
                                onerror={(event) => (event.target as HTMLImageElement).style.display = 'none'}
                        />
                        <span style="display: none; font-size: small;">{catalog.title}</span>
                    </Tooltip>
                {/if}
            </Flexbox>
        {/if}

    {/if}
</Card>

<!--<pre>{JSON.stringify(catalog, null, 2)}</pre>-->

<style lang="scss">
    .description{
      color: var(--color-text-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      :global(*){
        font-style: inherit !important;
        font-family: inherit !important;
        background: none !important;
        font-weight: inherit !important;
        text-align: inherit !important;
        font-size: small !important;
      }
    }
</style>
