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

    const {data} = $props();
    setContext("sectors", data.sectors);

    let addCatalogModal = $state({show: false})
</script>

<div class="sidebar-layout">
    <div style="width: 350px;">
        <h3>Search</h3>
        <Card style="margin-bottom: 1rem;">
            <Input type="text" id="search" placeholder="Search..." --bg="transparent" --border="none"/>
        </Card>
    </div>
    <Page title="Catalogs" description="Explore related data portals from municipal, national, and private sectors">
        {#snippet suffix()}
            <Button onclick={()=> addCatalogModal.show = true}>
                <Icon icon="plus-lg" margin="right"/>
                Add Catalog
            </Button>
        {/snippet}
        <Row xs={1} md={2} lg={3}>
            {#each data.catalogs as catalog}
                <Col>
                    <CatalogCard {catalog} fit/>
                </Col>
            {/each}
        </Row>
    </Page>
</div>

<Modal title="Add Catalog" bind:show={addCatalogModal.show}>
    <Form>
        <Input required type="select" label="API Standard" options={[
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
        <Input required type="text" label="API endpoint" placeholder="https://api.example.com"/>
        <Input type="text" label="API Key" placeholder="*********"/>
        <Flexbox justify="flex-end">
            <Button transparent onclick={()=> addCatalogModal.show = false}>Close</Button>
            <Button variant="primary" onclick={()=> addCatalogModal.show = false}><Icon icon="plus-lg" margin="right"/>Add Catalog</Button>
        </Flexbox>
    </Form>
</Modal>

<style lang="scss">
  @use "$lib/client/styles/mixins/responsive" as responsive;

  .sidebar-layout {
    padding-top: calc(70px + 2rem);
    display: flex;

    @include responsive.min-width(md) {
      padding-left: 2rem;
    }

    :global(.page) {
      flex: 1;
      padding-top: 0;
    }
  }


  .search-input {
    background: transparent;
    border: none;
    font-size: xx-large;
    border-bottom: solid 1px var(--color-border-primary);
    outline: none;
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>


