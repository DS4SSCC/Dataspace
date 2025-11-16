<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import SectionHeader from "$lib/client/components/SectionHeader.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import Input from "$lib/client/components/form/Input.svelte"; // Assuming you have this
    import {getSectorFromThemeUriOrId} from "$lib/client/helpers/sector.helper.ts";
    import {marked} from "marked";

    let {data} = $props<{
        dataset: {
            id: string;
            title: string;
            description: string;
            identifier: string;
            issued?: string;
            modified?: string;
            theme?: string;
            spatial?: string;
            temporalStart?: string;
            temporalEnd?: string;
            accessUrl?: string;
            downloadUrl?: string;
            mediaType?: string;
            license?: string;
            accessRights?: string;
            isPublished: boolean;
            policyIntent: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
            notes?: string;
            importedAt: string;
            publishedAt?: string;
            catalog: {
                title: string;
                name: string;
                apiStandard: string;
            }; // Include catalog info if available via join in repository
        };
    }>();

    // Example: Track local changes for illustrative policy settings (not saved in this prototype)
    let localPolicyIntent = $state(data.dataset.policyIntent);
    let localNotes = $state(data.dataset.notes || '');
    let localIsPublished = $state(data.dataset.isPublished);

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

    // --- Illustrative Functions (Out of Scope for Prototype) ---
    function handlePolicyChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        localPolicyIntent = target.value as 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
        console.log("Policy intent changed (not saved in prototype):", localPolicyIntent);
        // In a full implementation, this would trigger an action like `?/updateDataset`
    }

    function handleNotesChange(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        localNotes = target.value;
        console.log("Notes changed (not saved in prototype):", localNotes);
    }

    function handlePublishToggle() {
        localIsPublished = !localIsPublished;
        console.log("Publish status toggled (not saved in prototype):", localIsPublished);
    }

    function handleAccessRequest() {
        // Simulate requesting access (out of scope)
        alert(`Access request initiated for dataset "${data.dataset.title}".\n\nThis is a demonstration feature.\n\nIn a full system, this would trigger an OPA/IDS workflow.`);
    }

    function handleODRLRuleView() {
        // Simulate viewing/editing ODRL rules (out of scope)
        const exampleODRL = {
            "@context": "http://www.w3.org/ns/odrl.jsonld",
            "@type": "Offer",
            "uid": "http://example.org/policy/123",
            "target": data.dataset.identifier,
            "permission": [
                {
                    "action": ["read"],
                    "constraint": [
                        {
                            "leftOperand": "http://w3id.org/odrl/vocab#spatial",
                            "operator": "eq",
                            "rightOperand": data.dataset.spatial || "http://www.wikidata.org/entity/Q123" // Example
                        }
                    ]
                }
            ]
        };
        alert(`Viewing ODRL policy for dataset "${data.dataset.title}".\n\nExample ODRL Rule:\n${JSON.stringify(exampleODRL, null, 2)}`);
    }

    // --- End Illustrative Functions ---

</script>

<Page>
    <Section>
        <h1>{data.dataset?.title}</h1>
        <Flexbox gap="1rem" align="center">
            {#if currentSector}
                <SectorButton sector={currentSector} size="xs"/>
            {/if}
            <Button size="xs" variant={localIsPublished ? 'success' : 'secondary'}>
                {localIsPublished ? 'Published in DCAT-AP' : 'Not published'}
            </Button>
            <Button size="xs" variant={localPolicyIntent === 'PUBLIC' ? 'info' : 'warning'}>
                Policy Intent: {localPolicyIntent}
            </Button>
        </Flexbox>
    </Section>

    <!-- Description -->
    <Section>
        <SectionHeader title="Description"/>
        <Card>
            {@html marked(data.dataset?.description || '<em>No description available.</em>')}
        </Card>
    </Section>

    <!-- Source & Metadata Overview -->
    <Section>
        <SectionHeader title="Source & Metadata"/>
        <Card>
            <dl style="display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; align-items: start;">
                <dt><strong>Source Catalog:</strong></dt>
                <dd>{data.dataset.catalog?.title || 'N/A'} ({data.dataset.catalog?.apiStandard || 'N/A'})</dd>

                <dt><strong>Dataset Identifier:</strong></dt>
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

                {#if data.dataset.accessRights}
                    <dt><strong>Access Rights:</strong></dt>
                    <dd><code>{data.dataset.accessRights}</code></dd>
                {/if}

                {#if data.dataset.theme}
                    <dt><strong>Theme:</strong></dt>
                    <dd><code>{data.dataset.theme}</code></dd>
                {/if}

                {#if data.dataset.spatial}
                    <dt><strong>Spatial Coverage:</strong></dt>
                    <dd><code>{data.dataset.spatial}</code></dd>
                {/if}

                {#if data.dataset.temporalStart || data.dataset.temporalEnd}
                    <dt><strong>Temporal Coverage:</strong></dt>
                    <dd>
                        {data.dataset.temporalStart ? formatDate(data.dataset.temporalStart) : 'N/A'}
                        —
                        {data.dataset.temporalEnd ? formatDate(data.dataset.temporalEnd) : 'N/A'}
                    </dd>
                {/if}
            </dl>
        </Card>
    </Section>

    <!-- Access Links -->
    <Section>
        <SectionHeader title="Access"/>
        <Flexbox gap="1rem" wrap>
            {#if data.dataset.accessUrl}
                <Button size="sm" onclick={() => openUrl(data.dataset.accessUrl)}>
                    <Icon icon="link-45deg" margin="right"/>
                    API Endpoint
                </Button>
            {/if}
            {#if data.dataset.downloadUrl}
                <Button size="sm" onclick={() => openUrl(data.dataset.downloadUrl)}>
                    <Icon icon="download" margin="right"/>
                    Download ({data.dataset.mediaType || 'data'})
                </Button>
            {/if}
            {#if data.dataset.policyIntent !== 'PUBLIC'}
                <Button size="sm" onclick={handleAccessRequest}>
                    <Icon icon="key" margin="right"/>
                    Request Access
                </Button>
            {/if}
        </Flexbox>
    </Section>

    <!-- Illustrative Policy & Management Section -->
    <Section>
        <SectionHeader title="Dataset Management"/>
        <Card>
            <Flexbox direction="column" gap="1rem">
                <!-- Policy Intent Selector -->
                <Input
                        id="policy-intent-select"
                        type="select"
                        label="Policy Intent"
                        value={localPolicyIntent}
                        options={[
              { value: 'PUBLIC', label: 'Public (no access control)' },
              { value: 'RESTRICTED', label: 'Restricted (OPA-controlled)' },
              { value: 'INTERNAL', label: 'Internal (not published)' }
            ]}
                        onchange={handlePolicyChange}
                />

                <!-- View/Edit ODRL Rule Button -->
                <Button variant="secondary" size="sm" onclick={handleODRLRuleView}>
                    <Icon icon="pencil-square" margin="right"/>
                    View/Edit ODRL Policy Rule (Demo)
                </Button>

                <!-- Published Toggle -->
                <Input
                        id="publish-toggle"
                        type="checkbox"
                        checked={localIsPublished}
                        onchange={handlePublishToggle}
                        label="Include in DCAT-AP Feed"
                />

                <!-- Notes -->
                <Input
                        id="notes-textarea"
                        type="textarea"
                        value={localNotes}
                        onchange={handleNotesChange}
                        label="Internal Notes"
                        placeholder="Add internal notes about this dataset..."
                />
            </Flexbox>
        </Card>
    </Section>

    <!-- Debug (optional – remove in production) -->
    <!--
    <Section>
      <SectionHeader title="Debug Info" />
      <pre><code>{JSON.stringify(data.dataset, null, 2)}</code></pre>
    </Section>
    -->
</Page>
