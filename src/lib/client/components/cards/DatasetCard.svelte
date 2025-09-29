<script lang="ts">
    import Button from "$lib/client/components/Button.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import {getContext} from "svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Tooltip from "$lib/client/components/Tooltip.svelte";
    import {sanitizeHtmlToPlainText} from "$lib/client/helpers/string.helper";
    import {getSectorFromThemeUriOrId} from "$lib/client/helpers/sector.helper";

    // Gebruik het nieuwe type voor de dataset
    // dataset is nu optioneel
    let {dataset, fit, skeleton = false}: {
        dataset?: {
            id: string;
            title: string;
            description: string;
            issued?: string; // ISO 8601 date
            modified?: string; // ISO 8601 date
            publisher: {
                id: string;
                name: string;
            };
            themes: string[]; // URIs
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
        skeleton?: boolean // Nieuwe prop voor de skeleton mode
    } = $props();

    // sectors context (optioneel, aangepast aan nieuwe datastructuur)
    const sectors = getContext<{ id: string, name: string, description: string }[]>("sectors");

    // Vind de sector op basis van de eerste theme URI (of pas aan aan jouw logica)
    // Alleen uitvoeren als dataset beschikbaar is en niet in skeleton mode
    const currentSector = $derived.by(() => {
        if (skeleton || !dataset) return undefined; // Geen sector als skeleton of geen dataset
        try {
            return getSectorFromThemeUriOrId(dataset.themes[0]);
        } catch (err) {
            return undefined;
        }
    });

    // Hulpfunctie om datum te formatteren (optioneel)
    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
    };

    // Functie voor de fallback als de afbeelding faalt
    function onImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        // Verberg de img tag als de fallback is getoond
        target.style.display = 'none';
        // Optioneel: je kunt ook een placeholder-afbeelding instellen
        // target.src = '/path/to/placeholder-logo.svg';
        // Of het hele Tooltip component aanpassen, bijv. alleen de naam tonen zonder img
    }

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
                <!-- Placeholder voor datum -->
                <div style="background-color: var(--color-skeleton-bg, #e0e0e0); width: 50px; height: 14px; border-radius: 2px;"></div>
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
                <!--{#if dataset.modified}-->
                <!--    <span style="font-size: small; color: var(&#45;&#45;color-text-secondary)">{formatDate(dataset.modified)}</span>-->
                <!--{/if}-->
            </Flexbox>

            <div>
                <h3>{dataset.title}</h3>
                <p style="color: var(--color-text-secondary); display: -webkit-box; -webkit-line-clamp: 2;line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis">
                    {sanitizeHtmlToPlainText(dataset.description)}
                </p>
            </div>
        </div>

        <Flexbox justify="space-between" align="center" style="margin-top: 1rem;">
            {#if dataset.landingPage}
                <Button variant="text" size="sm" href={dataset.landingPage}>Bekijk Dataset</Button>
            {/if}
            {#if dataset.publisher?.name}
                <Tooltip text={dataset.publisher.name}>
                    <img
                            src="/publishers/{dataset.publisher.id.trim().replaceAll(' ', '-').toLowerCase()}/logo.svg"
                            height="20px"
                            alt="Logo van {dataset.publisher.name}"
                            on:error={onImageError}
                    />
                    <span style="display: none; font-size: small;">{dataset.publisher.name}</span>
                </Tooltip>
            {/if}
        </Flexbox>
    {/if}
</Card>
