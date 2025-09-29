<script>
    import Page from "$lib/client/components/Page.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import {setContext} from "svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import CatalogCard from "$lib/client/components/cards/CatalogCard.svelte";
    import Modal from "$lib/client/components/Modal.svelte";
    import Form from "$lib/client/components/form/Form.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import {goto} from "$app/navigation";

    const {data} = $props();
    setContext("sectors", data.sectors);

    let addCatalogModal = $state({show: false})
</script>

<Page title="Catalogs" description="Explore related data portals from municipal, national, and private sectors">
    {#snippet suffix()}
        <Button onclick={()=> addCatalogModal.show = true}>
            <Icon icon="plus-lg" margin="right"/>
            Add Catalog
        </Button>
    {/snippet}
    <Section>
        <Row xs={1} md={2} lg={3}>
            {#each data.catalogs as catalog}
                <Col>
                    <CatalogCard {catalog} fit onclick={()=> goto(`/catalogs/${catalog.id}`)}/>
                </Col>
            {/each}
        </Row>
    </Section>


    <!--        <pre><code>{JSON.stringify(data.catalogs, null, 2)}</code></pre>-->
</Page>

<Modal title="Add Catalog" bind:show={addCatalogModal.show}>
    <Form action="?/addCatalog" method="POST">
        <Input required type="text" label="Name" name="catalog.title" placeholder="Enter a name..."/>
        <Input required type="textarea" label="Description" name="catalog.description" placeholder="Describe the catalog..."/>
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
        <Input required type="text" label="API endpoint" name="catalog.apiUrl" placeholder="https://api.example.com"/>
        <Input type="text" label="API Key" name="catalog.apiKey" placeholder="*********"/>
        <Input type="checkbox" label="Active" name="catalog.isActive"/>
        <Flexbox justify="flex-end">
            <Button transparent onclick={()=> addCatalogModal.show = false}>Close</Button>
            <Button variant="primary" type="submit"><Icon icon="plus-lg" margin="right"/>Add Catalog</Button>
        </Flexbox>
    </Form>
</Modal>


