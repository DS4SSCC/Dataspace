<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import DatasetCard from "$lib/client/components/cards/DatasetCard.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import {setContext} from "svelte";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import SidebarLayout from "$lib/client/components/SidebarLayout.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    const {data} = $props();

    let sidebarState = $state<{show: boolean}>({show: true})

    setContext("sectors", data.sectors);
</script>

<SidebarLayout bind:show={sidebarState.show}>
    {#snippet sidebar()}
        <h3>Search</h3>
        <Card style="margin-bottom: 1rem;">
            <Input type="text" id="search" placeholder="Search..." --bg="transparent" --border="none" />
        </Card>
        <div style="margin-bottom: 1rem;">
            <h3>Sectors</h3>
            <div style="display: flex; gap: .5rem; flex-wrap: wrap;">
                {#each data.sectors as sector}
                    <SectorButton {sector} size="xs" style="white-space: nowrap">{sector.name}</SectorButton>
                {/each}
            </div>
        </div>
        <div style="margin-bottom: 1rem;">
            <h3>Catalogs</h3>
            <div style="display: flex; gap: .5rem; flex-wrap: wrap;">
                {#each data.catalogs as catalog}
                    <Button size="sm" style="white-space: nowrap">{catalog["dct:title"]}</Button>
                {/each}
            </div>
        </div>
    {/snippet}
    <Page title="Datasets" description="Explore datasets from a large selection of connected data portals from various sectors">
        <Section>
            <Button variant={sidebarState.show ? "primary" : "default"} onclick={()=> sidebarState.show = !sidebarState.show}><Icon icon="funnel-fill" margin="right"/>Filters</Button>
        </Section>
        <Section>
            <Row xs={1} md={2} xxl={3}>
                {#each data.datasets as dataset}
                    <Col>
                        <DatasetCard {dataset} fit/>
                    </Col>
                {/each}
            </Row>
        </Section>
    </Page>
</SidebarLayout>

