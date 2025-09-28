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

    const {data} = $props();
    setContext("sectors", data.sectors);
</script>

<div class="sidebar-layout">
    <div style="width: 350px;">
        <h3>Search</h3>
        <Card style="margin-bottom: 1rem;">
            <Input type="text" id="search" placeholder="Search..." --bg="transparent" --border="none" />
        </Card>
    </div>
    <Page title="Catalogs" description="Explore related data portals from municipal, national, and private sectors">
        {#snippet suffix()}
            <Button><Icon icon="plus-lg" margin="right"/>Add Portal</Button>
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


