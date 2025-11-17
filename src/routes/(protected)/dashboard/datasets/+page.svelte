<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import {goto} from "$app/navigation";
    import SectorButton from "$lib/client/components/buttons/SectorButton.svelte";
    import {getSectorFromThemeUriOrId} from "$lib/client/helpers/sector.helper";
    import Table from "$lib/client/components/table/Table.svelte";
    import Item from "$lib/client/components/table/Item.svelte";
    import Form from "$lib/client/components/form/Form.svelte";
    import {setContext} from "svelte";

    // Receive data from +page.server.ts
    let { data } = $props<{
        datasets: Array<{
            id: string;
            title: string;
            description: string;
            identifier: string; // External ID
            catalog: {
                title: string;
            }; // If joined in repository
            isPublished: boolean;
            policyIntent: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
            importedAt: string; // ISO date string
            publishedAt?: string; // ISO date string
            // Add other fields if needed later
        }>;
    }>();

    // Filters (initially empty)
    let searchTerm = $state('');
    let filterAccess = $state('all'); // 'all', 'PUBLIC', 'RESTRICTED', 'INTERNAL'
    let sortBy = $state('title'); // 'title', 'importedAt'

    // Derived filtered and sorted datasets
    let filteredDatasets = $derived.by(() => {
        let result = data.datasets.filter(dataset => {
            const matchesSearch = dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAccess = filterAccess === 'all' || dataset.policyIntent === filterAccess;
            return matchesSearch && matchesAccess;
        });

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'importedAt') return new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime();
            // Add other sort options if needed
            return 0;
        });

        return result;
    });

    // Helper function to format dates
    function formatDate(dateStr: string | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Helper function to get badge variant based on policy
    function getPolicyVariant(policy: string): string {
        if (policy === 'PUBLIC') return 'success';
        if (policy === 'RESTRICTED') return 'warning';
        return 'secondary'; // INTERNAL or unknown
    }

    // Helper function to confirm deletion before submitting the form
    async function confirmAndSubmit(event: SubmitEvent, datasetTitle: string) {
        const formElement = event.currentTarget as HTMLFormElement;
        if (confirm(`Are you sure you want to delete the dataset "${datasetTitle}"? This action cannot be undone.`)) {
            // Proceed with the form submission
            // The form's action="?/deleteDataset" will handle the submission
            // No need to call formElement.requestSubmit() explicitly here
            // as the default form submission will occur if confirm is true.
        } else {
            // Prevent the form from submitting if the user cancels
            event.preventDefault();
        }
    }

    setContext("sectors", data.sectors);
    setContext("catalogs", data.catalogs);
</script>

<Page title="My Datasets" description="Manage your imported datasets and their publication status">
    {#snippet suffix()}
        <Button variant="primary" disabled> <!-- Disable upload for now, out of scope -->
            <Icon icon="plus-lg" margin="right"/>
            Upload Dataset
        </Button>
    {/snippet}

    <Section>
        <Flexbox justify="space-between" align="center" gap="1rem">
            <Card style="flex: 1">
                <Input
                        type="text"
                        placeholder="Search datasets..."
                        bind:value={searchTerm}
                        --bg="transparent"
                        --border="none"
                />
            </Card>
            <Card>
                <Input
                        type="select"
                        bind:value={filterAccess}
                        --bg="transparent"
                        --border="none"
                        options={[
                        {label: "All Access", value: 'all'},
                        {label: "Public", value: 'PUBLIC'},
                        {label: "Restricted", value: 'RESTRICTED'},
                        {label: "Internal", value: 'INTERNAL'}
                    ]}
                />
            </Card>
            <Card>
                <Input
                        type="select"
                        bind:value={sortBy}
                        --bg="transparent"
                        --border="none"
                        options={[
                        {label: "Sort by Name", value: 'title'},
                        {label: "Imported Date", value: 'importedAt'}
                    ]}
                />
            </Card>
        </Flexbox>
    </Section>

    <Section>
        <Card>
            <Table>
                {#snippet head()}
                    <Item type="row">
                        <Item type="header">Dataset</Item>
                        <Item type="header">Source</Item>
                        <Item type="header">Published</Item>
                        <Item type="header">Policy</Item>
                        <Item type="header">Imported</Item>
                        <Item type="header">Actions</Item>
                    </Item>
                {/snippet}
                {#each filteredDatasets as dataset (dataset.id)}
                    <Item type="row">
                        <Item onclick={() => goto(`/dashboard/datasets/${dataset.id}`)} style="cursor: pointer">
                            <div class="dataset-name">{dataset.title}</div>
                            <SectorButton sector={getSectorFromThemeUriOrId(dataset?.theme)} size="xs"/>
                        </Item>
                        <Item>{dataset.catalog?.title || 'N/A'}</Item>
                        <Item>
                                <span class={`access ${dataset.isPublished ? 'published' : 'not-published'}`}>
                                    {dataset.isPublished ? 'Yes' : 'No'}
                                </span>
                        </Item>
                        <Item>
                            <Button size="sm" variant={getPolicyVariant(dataset.policyIntent)}>
                                {dataset.policyIntent}
                            </Button>
                        </Item>
                        <Item>{formatDate(dataset.importedAt)}</Item>
                        <Item>
                            <Flexbox gap="0.5rem">
                                <Button size="sm" onclick={() => goto(`/dashboard/datasets/${dataset.id}`)}>
                                    <Icon icon="eye" />
                                </Button>
                                <!-- Edit button can be added later if needed -->
                                <Button size="sm">
                                    <Icon icon="pencil" />
                                </Button>
                                <!-- Delete button wrapped in a form -->
                                <Form action="/dashboard/datasets/{dataset.id}?/delete" method="POST">
                                    <Button size="sm" --color="var(--color-danger)" type="submit">
                                        <Icon icon="trash" />
                                    </Button>
                                </Form>
                            </Flexbox>
                        </Item>
                    </Item>
                {/each}
            </Table>
            {#if filteredDatasets.length === 0}
                <div class="no-results">
                    <Icon icon="folder" size="3x" />
                    <p>No datasets found matching your criteria</p>
                </div>
            {/if}
        </Card>
    </Section>

    <Section>
        <Row>
            <Col>
                <Card fit>
                    <h3>Dataset Statistics</h3>
                    <div class="stat-card">
                        <div class="stat-value">{data.datasets.length}</div>
                        <div class="stat-label">Total Datasets</div>
                    </div>
                    <div class="stat-value">{data.datasets.filter(ds => ds.isPublished).length}</div>
                    <div class="stat-label">Published Datasets</div>
                    <div class="stat-value">{data.datasets.filter(ds => ds.policyIntent === 'PUBLIC').length}</div>
                    <div class="stat-label">Public Datasets</div>
                </Card>
            </Col>
            <Col>
                <Card fit>
                    <h3>Policy Distribution</h3>
                    <div class="chart-container">
                        {#each ['PUBLIC', 'RESTRICTED', 'INTERNAL'] as policy}
                            <div class="chart-bar">
                                <div class="chart-label">{policy}</div>
                                <div class="chart-bar-inner">
                                    <div
                                            class="chart-bar-fill"
                                            style="width: {Math.round((data.datasets.filter(ds => ds.policyIntent === policy).length / data.datasets.length) * 100)}%"
                                    ></div>
                                    <div class="chart-bar-text">
                                        {Math.round((data.datasets.filter(ds => ds.policyIntent === policy).length / data.datasets.length) * 100)}%
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </Card>
            </Col>
        </Row>
    </Section>
    <Section>
        <pre><code>{JSON.stringify(data, null,2)}</code></pre>
    </Section>
</Page>

<style>
    .dataset-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .dataset-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
    }

    .dataset-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .downloads-cell {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .no-results {
        text-align: center;
        padding: 3rem 20px;
        color: var(--color-text-tertiary);
    }

    .stat-card {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--color-border-primary);
    }

    .stat-card:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
    }

    .stat-label {
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }

    .chart-container {
        padding: 1rem 0;
    }

    .chart-bar {
        margin-bottom: 1rem;
    }

    .chart-bar:last-child {
        margin-bottom: 0;
    }

    .chart-label {
        font-weight: 500;
        margin-bottom: 0.5rem;
    }

    .chart-bar-inner {
        position: relative;
        height: 24px;
        background: var(--color-background-tertiary);
        border-radius: 12px;
        overflow: hidden;
    }

    .chart-bar-fill {
        height: 100%;
        background: var(--color-primary);
        transition: width 0.5s ease;
    }

    .chart-bar-text {
        position: absolute;
        top: 50%;
        left: 8px;
        transform: translateY(-50%);
        color: white;
        font-weight: 500;
        font-size: 0.8rem;
    }

    .access.published {
        color: var(--color-success);
    }
    .access.not-published {
        color: var(--color-secondary);
    }
</style>
