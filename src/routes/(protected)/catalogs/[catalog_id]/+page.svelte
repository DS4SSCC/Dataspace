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

    let {data} = $props();

    let editCatalogModal = $state({show: false})

    const datasets = $derived(data.catalog.datasets);

    let sidebarState = $state<{ show: boolean }>({show: true})
</script>

<SidebarLayout bind:show={sidebarState.show}>
    {#snippet sidebar()}
        <h3>Search</h3>
        <Card style="margin-bottom: 1rem;">
            <Input type="text" id="search" placeholder="Search..." --bg="transparent" --border="none"/>
        </Card>
        <div style="margin-bottom: 1rem;">
            <h3>Sectors</h3>
            <div style="display: flex; gap: .5rem; flex-wrap: wrap;">
                {#each data.sectors as sector}
                    <SectorButton {sector} size="xs" style="white-space: nowrap">{sector.name}</SectorButton>
                {/each}
            </div>
        </div>
    {/snippet}
    <Page title={data.catalog.title} description={data.catalog.description}>
        {#snippet prefix()}
            <Button style="margin-bottom: 1rem" size="sm" onclick={()=> goto('/catalogs')}>
                <Icon icon="arrow-left" margin="right"/>
                Catalogs
            </Button>
        {/snippet}
        <Section>
            <Flexbox justify="space-between" gap=".5rem">
                <Button variant={sidebarState.show ? "primary" : "default"} onclick={()=> sidebarState.show = !sidebarState.show}>
                    <Icon icon="funnel-fill" margin="right"/>
                    Filters
                </Button>
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
            <SectionHeader title="Datasets"/>

            {#await data.catalog.datasets}
                <!-- promise is pending -->
                <Row xs={1} md={2} xxl={3}>
                    {#each Array(8) as _, i}
                        <Col>
                            <DatasetCard skeleton fit/>
                        </Col>
                    {/each}
                </Row>
            {:then value}
                <!-- promise was fulfilled or not a Promise -->
                <Row xs={1} md={2} xxl={3}>
                    {#each value as dataset (dataset.id)}
                        <Col>
                            <DatasetCard {dataset} fit/>
                        </Col>
                    {/each}
                </Row>
            {:catch error}
                <!-- promise was rejected -->
                <Flexbox align="center" direction="column" style="text-align: center;">
                    <h4 style="margin-bottom: 0">Datasets cannot be collected</h4>
                    <p>Something went wrong: {error.message}</p>
                </Flexbox>
            {/await}
        </Section>
        <Section>
<!--            <pre><code>{JSON.stringify(datasets, null, 2)}</code></pre>-->
        </Section>
    </Page>
</SidebarLayout>

<Modal title="Edit Catalog" bind:show={editCatalogModal.show}>
    <Form action="?/updateCatalog" method="POST" onsuccess={()=> editCatalogModal.show = false}>
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
