<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Modal from "$lib/client/components/Modal.svelte";
    import Form from "$lib/client/components/form/Form.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import DatasetCard from "$lib/client/components/cards/DatasetCard.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import SectionHeader from "$lib/client/components/SectionHeader.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import {goto} from "$app/navigation";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import SidebarLayout from "$lib/client/components/SidebarLayout.svelte";
    import Searchbar from "$lib/client/components/form/Searchbar.svelte";
    import {addToast} from "$lib/client/stores/toast.store";

    let {data} = $props();

    let editCatalogModal = $state({show: false});
    let importModal = $state<{ show: boolean; dataset: any | null }>({show: false, dataset: null});
    let searchInput = $state('');

    // We'll store the resolved datasets here once available
    let resolvedDatasets: any[] = $state([]);

    // Helper to filter datasets (called in template)
    function filterDatasets(datasets: any[]) {
        if (!searchInput) return datasets;
        const q = searchInput.toLowerCase();
        return datasets.filter(ds =>
            ds.title.toLowerCase().includes(q) ||
            (ds.description && ds.description.toLowerCase().includes(q))
        );
    }

    function filterAndSortDatasets(datasets: any[]) {
        if (!datasets) return [];

        // Create a Set for fast lookup
        const importedIdentifiers = new Set(data.localDatasets.map(ds => ds.identifier));

        let filtered = datasets;
        if (searchInput) {
            const q = searchInput.toLowerCase();
            filtered = datasets.filter(ds =>
                ds.title.toLowerCase().includes(q) ||
                (ds.description && ds.description.toLowerCase().includes(q))
            );
        }

        // Sort: imported (1) first, then unimported (0)
        return filtered.sort((a, b) => {
            const aImported = importedIdentifiers.has(a.id) ? 1 : 0;
            const bImported = importedIdentifiers.has(b.id) ? 1 : 0;
            return bImported - aImported; // descending: 1 comes before 0
        });
    }

    function openImportModal(dataset: any) {
        importModal = {show: true, dataset};
    }

    function closeImportModal() {
        importModal.show = false;
        importModal.dataset = null;
    }

</script>

<Page title={data.catalog.title} description={data.catalog.description}>
    {#snippet prefix()}
        <Button style="margin-bottom: 1rem" size="sm" onclick={()=> goto('/dashboard/catalogs')}>
            <Icon icon="arrow-left" margin="right"/>
            Catalogs
        </Button>
    {/snippet}
    <Section>
        <Flexbox justify="flex-end" gap=".5rem">
            <Flexbox columnGap=".5rem">
                <Button onclick={()=> editCatalogModal.show = true}>
                    <Icon icon="pencil-fill" margin="right"/>
                    Edit
                </Button>
                <Button variant={data.catalog.isActive ? 'success' : 'danger'}>{data.catalog.isActive ? 'Active' : 'Inactive'}</Button>
            </Flexbox>
        </Flexbox>
    </Section>
    <Section>
        <Card>
            <Input
                    type="text"
                    --bg="transparent"
                    --border="none"
                    placeholder="Search datasets from {data.catalog.title}"
                    bind:value={searchInput}
            />
        </Card>
    </Section>
    <Section>
        <SectionHeader title="Datasets"/>
        {#await data.catalog.datasets}
            <Row xs={1} md={2} xxl={3}>
                {#each Array(8) as _, i}
                    <Col>
                        <DatasetCard skeleton fit importable/>
                    </Col>
                {/each}
            </Row>
        {:then datasets}
            <!-- Filter and render -->
            <Row xs={1} md={2} xxl={3}>
                {#each filterAndSortDatasets(datasets) as dataset (dataset.id)}
                    {@const localDataset = data.localDatasets.find(ds => ds.identifier === dataset.id)}
                    {@const imported = localDataset ? 1 : 0}
                    <Col>
                        <DatasetCard
                                {dataset}
                                fit
                                importable
                                {imported}
                                onimport={() => openImportModal(dataset)}
                                onclick={() => {
                                    if (imported) {
                                      goto(`/dashboard/datasets/${localDataset.id}`);
                                    } else {
                                      window.open(dataset.landingPage, '_blank');
                                    }
                                }}
                        />
                    </Col>
                {/each}
            </Row>
        {:catch error}
            <Flexbox align="center" direction="column" style="text-align: center;">
                <h4>Datasets cannot be collected</h4>
                <p>Something went wrong: {error.message}</p>
            </Flexbox>
        {/await}
    </Section>
    <!--Debugging-->
    <Section>
        <pre><code>{JSON.stringify(filterDatasets(data.datasets), null, 2)}</code></pre>
        <pre><code>{JSON.stringify(data.localDatasets, null, 2)}</code></pre>
    </Section>
</Page>

<Modal
        title="Import Dataset"
        description="Configure how this dataset will be managed in your dataspace"
        bind:show={importModal.show}
>
    {#if importModal.dataset}
        <Form
                action="?/importDataset"
                method="POST"
                onsuccess={() => {closeImportModal(); addToast('Dataset imported', null, {style: '--accent: var(--color-success)'});}}
        >
            <!-- Hidden field: dataset identifier (secure, but we re-fetch server-side anyway) -->
            <Input type="hidden" name="dataset.identifier" value={importModal.dataset.id}/>

            <Input
                    type="text"
                    label="Title"
                    value={importModal.dataset.title}
                    disabled
            />
            <Input
                    type="textarea"
                    label="Description"
                    value={importModal.dataset.description || '—'}
                    disabled
            />

            <Input
                    type="checkbox"
                    label="Publish in DCAT-AP feed"
                    name="dataset.isPublished"
                    checked
            />

            <Input
                    type="select"
                    label="Access Policy"
                    name="dataset.policyIntent"
                    options={[
                    { value: 'PUBLIC', label: 'Public (no access control)' },
                    { value: 'RESTRICTED', label: 'Restricted (OPA-controlled)' },
                    { value: 'INTERNAL', label: 'Internal (not published)' }
                ]}
                    value="PUBLIC"
            />

            <Flexbox justify="flex-end">
                <Button transparent onclick={closeImportModal}>Cancel</Button>
                <Button variant="primary" type="submit">
                    <Icon icon="cloud-download-fill" margin="right"/>
                    Import Metadata
                </Button>
            </Flexbox>
        </Form>
    {/if}
</Modal>

<Modal title="Edit Catalog" bind:show={editCatalogModal.show}>
    <Form action="?/updateCatalog" method="POST" onsuccess={()=> editCatalogModal.show = false} reset={false}
          invalidateAll={false}>
        <Input required type="text" label="Name" name="catalog.title" placeholder="Enter a name..."
               value={data.catalog.title}/>
        <Input required type="textarea" label="Description" name="catalog.description"
               placeholder="Describe the catalog..." value={data.catalog.description}/>
        <Input required type="select" label="API Standard" name="catalog.apiStandard" options={[
          { "value": "opendatasoft_explore_v2", "label": "ODS Explore API V2" },
          { "value": "ckan_api_v3", "label": "CKAN API v3" },
          { "value": "socrata", "label": "Socrata (SODA API)" },
          { "value": "arcgis_rest", "label": "ArcGIS REST API" },
          { "value": "datagouvfr", "label": "data.gouv.fr API" },
          { "value": "geonetwork", "label": "GeoNetwork (CSW/REST API)" },
          { "value": "fme", "label": "FME Server API" },
          { "value": "azure_open_data", "label": "Azure Open Datasets API" },
          { "value": "google_bigquery", "label": "Google BigQuery API" },
          { "value": "aws_data_exchange", "label": "AWS Data Exchange API" }
        ]}></Input>
        <Input required type="text" label="API endpoint" name="catalog.apiUrl" placeholder="https://api.example.com"
               value={data.catalog.apiUrl}/>
        <Input type="text" label="API Key" name="catalog.apiKey" placeholder="*********" value={data.catalog.apiKey}/>
        <Input type="checkbox" label="Active" name="catalog.isActive" value={data.catalog.isActive}/>
        <Flexbox justify="flex-end">
            <Button transparent onclick={()=> editCatalogModal.show = false}>Close</Button>
            <Button variant="primary" type="submit">
                <Icon icon="floppy-fill" margin="right"/>
                Save Changes
            </Button>
        </Flexbox>
    </Form>
</Modal>
