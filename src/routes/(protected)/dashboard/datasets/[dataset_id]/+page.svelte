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
    import {getSectorFromThemeUriOrId} from "$lib/client/helpers/sector.helper";
    import {marked} from "marked";
    import Form from "$lib/client/components/form/Form.svelte";
    import Modal from "$lib/client/components/Modal.svelte";
    import MonacoEditor from "$lib/client/components/form/inputs/MonacoEditor.svelte";
    import regoLang from "$lib/client/helpers/rego.lang";

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
            temporal_start?: string;
            temporal_end?: string;
            access_url?: string;
            download_url?: string;
            media_type?: string;
            license?: string;
            access_rights?: string;
            is_published: boolean;
            policy_intent: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
            notes?: string;
            imported_at: string;
            published_at?: string;
            catalog: {
                title: string;
                name: string;
                api_standard: string;
            }; // Include catalog info if available via join in repository
        };
    }>();

    // Example: Track local changes for illustrative policy settings (not saved in this prototype)
    let localNotes = $state(data.dataset.notes || '');
    let localIsPublished = $state(data.dataset.is_published);

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
        data.dataset.policy_intent = target.value as 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
        console.log("Policy intent changed (not saved in prototype):", data.dataset.policy_intent);
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

    const exampleRego = `
        package ds4sscc.policy.${data.dataset.id}

        default hello := false

        hello if input.message == "world"
    `

    let editMode = $state({
        title: false,
        description: false
    })

    let policyModal = $state({
        show: false,
        value: data.dataset?.policy?.raw || exampleRego
    })
</script>

<Page>
    <Section>
        <Flexbox align="center" gap="0.5rem" style="margin-bottom: 1rem">
            {#if editMode.title}
                <Form action="?/update" id="title-form" onsuccess={()=> editMode.title = false}>
                    <Input name="dataset.title" value={data.dataset?.title} placeholder="Dataset title"/>
                </Form>
                <Button form="title-form" type="submit" variant="primary">
                    <Icon icon="floppy-fill"/>
                </Button>
                <Button onclick={()=> editMode.title = false}>
                    Cancel
                </Button>
            {:else}
                <h1 style="margin-bottom: 0">{data.dataset?.title}</h1>
                <Button onclick={()=> editMode.title = true}>
                    <Icon icon="pencil-fill"/>
                </Button>
            {/if}
        </Flexbox>
        <Flexbox gap="1rem" align="center">
            {#if currentSector}
                <SectorButton sector={currentSector} size="xs"/>
            {/if}
            <Button size="xs" variant={localIsPublished ? 'success' : 'secondary'}>
                {localIsPublished ? 'Published in DCAT-AP' : 'Not published'}
            </Button>
            <Button size="xs" variant={data.dataset.policy_intent === 'PUBLIC' ? 'info' : 'warning'}>
                Policy Intent: {data.dataset.policy_intent}
            </Button>
        </Flexbox>
    </Section>

    <!-- Description -->
    <Section>
        <SectionHeader title="Description">
            {#snippet suffix()}
                {#if editMode.description}
                    <Button form="description-form" type="submit">
                        <Icon icon="floppy-fill"/>
                    </Button>
                {:else}
                    <Button onclick={()=> editMode.description = !editMode.description}>
                        <Icon icon="pencil-fill"/>
                    </Button>
                {/if}
            {/snippet}
        </SectionHeader>
        <Card>
            {#if editMode.description}
                <Form action="?/update" id="description-form" onsuccess={()=> editMode.description = false}>
                    <Input type="textarea" name="dataset.description" rows={12} value={data.dataset?.description}/>
                </Form>
            {:else}
                <div class="description">
                    {@html marked(data.dataset?.description || '<em>No description available.</em>')}
                </div>
            {/if}

        </Card>
    </Section>

    <!-- Source & Metadata Overview -->
    <Section>
        <SectionHeader title="Source & Metadata"/>
        <Card>
            <dl style="display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; align-items: start;">
                <dt><strong>Source Catalog:</strong></dt>
                <dd>{data.dataset.catalog?.title || 'N/A'} ({data.dataset.catalog?.api_standard || 'N/A'})</dd>

                <dt><strong>Dataset Identifier:</strong></dt>
                <dd><code>{data.dataset.identifier}</code></dd>

                <dt><strong>Imported:</strong></dt>
                <dd>{formatDate(data.dataset.importedAt)}</dd>

                {#if data.dataset.published_at}
                    <dt><strong>Published:</strong></dt>
                    <dd>{formatDate(data.dataset.published_at)}</dd>
                {/if}

                <dt><strong>Last modified:</strong></dt>
                <dd>{formatDate(data.dataset.modified)}</dd>

                {#if data.dataset.license}
                    <dt><strong>License:</strong></dt>
                    <dd><code>{data.dataset.license}</code></dd>
                {/if}

                {#if data.dataset.access_rights}
                    <dt><strong>Access Rights:</strong></dt>
                    <dd><code>{data.dataset.access_rights}</code></dd>
                {/if}

                {#if data.dataset.theme}
                    <dt><strong>Theme:</strong></dt>
                    <dd><code>{data.dataset.theme}</code></dd>
                {/if}

                {#if data.dataset.spatial}
                    <dt><strong>Spatial Coverage:</strong></dt>
                    <dd><code>{data.dataset.spatial}</code></dd>
                {/if}

                {#if data.dataset.temporalStart || data.dataset.temporal_end}
                    <dt><strong>Temporal Coverage:</strong></dt>
                    <dd>
                        {data.dataset.temporal_start ? formatDate(data.dataset.temporal_start) : 'N/A'}
                        —
                        {data.dataset.temporal_end ? formatDate(data.dataset.temporal_end) : 'N/A'}
                    </dd>
                {/if}
            </dl>
        </Card>
    </Section>

    <!-- Access Links -->
    <Section>
        <SectionHeader title="Access"/>
        <Card style="margin-bottom: 1rem">
            <Flexbox direction="column" gap="1rem">
                <!-- Policy Intent Selector -->
                <Form action="?/update">
                    {#snippet children({form})}
                        <Input type="select" label="Policy Intent"
                               name="dataset.policy_intent"
                               onchange={() => form.requestSubmit()}
                               options={[
                                { value: 'PUBLIC', label: 'Public (no access control)', selected: data.dataset.policy_intent === 'PUBLIC' },
                                { value: 'RESTRICTED', label: 'Restricted (OPA-controlled)', selected: data.dataset.policy_intent === 'RESTRICTED' },
                                { value: 'INTERNAL', label: 'Internal (not published)', selected: data.dataset.policy_intent === 'INTERNAL' }
                           ]}
                        />
                    {/snippet}
                </Form>
                {#if data.dataset.policy_intent === 'RESTRICTED'}
                    <!-- View/Edit ODRL Rule Button -->
                    <Button variant="secondary" size="sm" onclick={()=> policyModal.show = true}>
                        <Icon icon="pencil-square" margin="right"/>
                        View/Edit ODRL Policy Rule (Demo)
                    </Button>
                {/if}
            </Flexbox>
        </Card>
        <Flexbox gap=".5rem">
            {#if data.dataset.access_url}
                <Button size="sm" onclick={() => openUrl(data.dataset.access_url)}>
                    <Icon icon="link-45deg" margin="right"/>
                    API Endpoint
                </Button>
            {/if}
            {#if data.dataset.download_url}
                <Button size="sm" onclick={() => openUrl(data.dataset.download_url)}>
                    <Icon icon="download" margin="right"/>
                    Download ({data.dataset.mediaType || 'data'})
                </Button>
            {/if}
            {#if data.dataset.policy_intent !== 'PUBLIC'}
                <Button size="sm" onclick={handleAccessRequest}>
                    <Icon icon="key" margin="right"/>
                    Request Access
                </Button>
            {/if}
        </Flexbox>
    </Section>

    <!-- Debug (optional – remove in production) -->
    <!--
    <Section>
      <SectionHeader title="Debug Info" />
      <pre><code>{JSON.stringify(data.dataset, null, 2)}</code></pre>
    </Section>
    -->
</Page>


<Modal title="Policy Rule" bind:show={policyModal.show} --width="900px">
    <Form id="policy-form" action="?/update" onsuccess={()=> policyModal.show = false}>
        <Input type="hidden" name="dataset.policy_intent" value={data.dataset.policy_intent} />
        <Input type="hidden" name="dataset.policy.raw" value={policyModal.value}/>
        <MonacoEditor bind:value={policyModal.value} language="rego" onmount={[regoLang]} style="min-height: 500px"/>
    </Form>
    {#snippet footer()}
        <Flexbox justify="flex-end">
            <Button transparent onclick={()=> policyModal.show = false}>Close</Button>
            <Button variant="primary" type="submit" form="policy-form"><Icon icon="floppy-fill" margin="right"/>Save Changes</Button>
        </Flexbox>
    {/snippet}
</Modal>

<style lang="scss">
  .description {
    color: var(--color-text-secondary);
    text-align: left;

    :global(*) {
      font-style: inherit !important;
      font-family: inherit !important;
      background: none !important;
      font-weight: inherit !important;
      text-align: inherit !important;
      font-size: small !important;
    }
  }
</style>
