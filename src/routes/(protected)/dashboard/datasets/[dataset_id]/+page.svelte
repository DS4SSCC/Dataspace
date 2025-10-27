<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import SectionHeader from "$lib/client/components/SectionHeader.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import { getSectorFromThemeUriOrId } from "$lib/client/helpers/sector.helper.ts";

    let { data } = $props<{
        dataset: {
            id: string;
            title: string;
            description: string;
            identifier: string;
            issued?: string;
            modified?: string;
            theme?: string;
            accessUrl?: string;
            downloadUrl?: string;
            mediaType?: string;
            license?: string;
            isPublished: boolean;
            policyIntent: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
            importedAt: string;
            publishedAt?: string;
        };
    }>();

    const currentSector = $derived.by(() => {
        try {
            return getSectorFromThemeUriOrId(data.dataset?.theme);
        } catch {
            return undefined;
        }
    });

    function formatDate(dateString?: string): string {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function openUrl(url?: string) {
        if (url) window.open(url, '_blank');
    }
</script>

<Page title={data.dataset?.title}>
    <!-- Header with sector and status -->
    <Section>
        <Flexbox gap="1rem" align="center" wrap>
            {#if currentSector}
                <SectorButton sector={currentSector} size="xs" />
            {/if}
            <Button size="xs" variant={data.dataset.isPublished ? 'success' : 'secondary'}>
                {data.dataset.isPublished ? 'Published in DCAT-AP' : 'Not published'}
            </Button>
            <Button size="xs" variant={data.dataset.policyIntent === 'PUBLIC' ? 'info' : 'warning'}>
                Policy: {data.dataset.policyIntent}
            </Button>
        </Flexbox>
    </Section>

    <!-- Description -->
    <Section>
        <Card>
            {@html data.dataset?.description || '<em>No description available.</em>'}
        </Card>
    </Section>

    <!-- Metadata Overview -->
    <Section>
        <SectionHeader title="Metadata" />
        <Card>
            <dl style="display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; align-items: start;">
                <dt><strong>Identifier:</strong></dt>
                <dd><code>{data.dataset.identifier}</code></dd>

                <dt><strong>Imported:</strong></dt>
                <dd>{formatDate(data.dataset.importedAt)}</dd>

                {#if data.dataset.publishedAt}
                    <dt><strong>Published:</strong></dt>
                    <dd>{formatDate(data.dataset.publishedAt)}</dd>
                {/if}

                <dt><strong>Last modified:</strong></dt>
                <dd>{formatDate(data.dataset.modified)}</dd>

                {#if data.dataset.license}
                    <dt><strong>License:</strong></dt>
                    <dd><code>{data.dataset.license}</code></dd>
                {/if}

                {#if data.dataset.theme}
                    <dt><strong>Theme:</strong></dt>
                    <dd><code>{data.dataset.theme}</code></dd>
                {/if}
            </dl>
        </Card>
    </Section>

    <!-- Access Links -->
    <Section>
        <SectionHeader title="Access" />
        <Flexbox gap="1rem" wrap>
            {#if data.dataset.accessUrl}
                <Button size="sm" onclick={() => openUrl(data.dataset.accessUrl)}>
                    <Icon icon="link-45deg" margin="right" />
                    API Endpoint
                </Button>
            {/if}
            {#if data.dataset.downloadUrl}
                <Button size="sm" onclick={() => openUrl(data.dataset.downloadUrl)}>
                    <Icon icon="download" margin="right" />
                    Download ({data.dataset.mediaType || 'data'})
                </Button>
            {/if}
        </Flexbox>
    </Section>

    <!-- Debug (optional – remove in production) -->
    <!--
    <Section>
      <pre><code>{JSON.stringify(data.dataset, null, 2)}</code></pre>
    </Section>
    -->
</Page>
