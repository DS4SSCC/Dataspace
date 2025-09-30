<script>
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

    // Dataset data
    let datasets = [
        {
            id: 'ds-1',
            name: 'COVID-19 Statistics',
            description: 'Global COVID-19 statistics with daily updates',
            size: '12.4 MB',
            downloads: 1248,
            access: 'public',
            lastUpdated: '2023-10-20',
            tags: ['health', 'statistics', 'covid']
        },
        {
            id: 'ds-2',
            name: 'Financial Market Data',
            description: 'Real-time financial market data for major indices',
            size: '8.7 MB',
            downloads: 876,
            access: 'protected',
            lastUpdated: '2023-10-19',
            tags: ['finance', 'market', 'stocks']
        },
        {
            id: 'ds-3',
            name: 'Weather Patterns',
            description: 'Historical weather data for major cities',
            size: '24.1 MB',
            downloads: 542,
            access: 'private',
            lastUpdated: '2023-10-18',
            tags: ['weather', 'climate', 'historical']
        },
        {
            id: 'ds-4',
            name: 'Population Census',
            description: 'Decennial population census data',
            size: '42.3 MB',
            downloads: 2103,
            access: 'public',
            lastUpdated: '2023-10-15',
            tags: ['population', 'demographics', 'census']
        },
        {
            id: 'ds-5',
            name: 'Economic Indicators',
            description: 'Global economic indicators dataset',
            size: '15.6 MB',
            downloads: 634,
            access: 'protected',
            lastUpdated: '2023-10-10',
            tags: ['economy', 'indicators', 'global']
        }
    ];

    // Filters
    let searchTerm = '';
    let filterAccess = 'all';
    let sortBy = 'name';

    // Filter and sort datasets
    $: filteredDatasets = datasets
        .filter(dataset => {
            const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAccess = filterAccess === 'all' || dataset.access === filterAccess;
            return matchesSearch && matchesAccess;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'downloads') return b.downloads - a.downloads;
            if (sortBy === 'lastUpdated') return new Date(b.lastUpdated) - new Date(a.lastUpdated);
            return 0;
        });

    // Toggle dataset access
    function toggleAccess(id) {
        const dataset = datasets.find(d => d.id === id);
        if (dataset) {
            if (dataset.access === 'public') dataset.access = 'private';
            else if (dataset.access === 'private') dataset.access = 'protected';
            else dataset.access = 'public';
        }
    }

    // Delete dataset
    function deleteDataset(id) {
        datasets = datasets.filter(d => d.id !== id);
    }
</script>

<Page title="My Datasets" description="Manage your datasets and track their usage">
    {#snippet suffix()}
        <Button variant="primary">
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
                        {label: "Public", value: 'public'},
                        {label: "Protected", value: 'protected'},
                        {label: "Private", value: 'private'}
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
                        {label: "Sort by Name", value: 'name'},
                        {label: "Downloads", value: 'downloads'},
                        {label: "Last Updated", value: 'lastUpdated'}
                    ]}
                />
            </Card>
        </Flexbox>
    </Section>

    <Section>
        <Card>
            <div class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Dataset</th>
                        <th>Description</th>
                        <th>Size</th>
                        <th>Downloads</th>
                        <th>Access</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each filteredDatasets as dataset}
                        <tr>
                            <td onclick={()=> goto('/dashboard/datasets/dummy')} style="cursor: pointer">
                                <div class="dataset-info">
                                    <Button size="lg" --color="var(--color-primary)">
                                        <Icon icon="file-earmark-spreadsheet" />
                                    </Button>
                                    <div>
                                        <div class="dataset-name">{dataset.name}</div>
                                        <div class="dataset-tags">
                                            {#each dataset.tags as tag}
                                                <Button size="xs">{tag}</Button>
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>{dataset.description}</td>
                            <td>{dataset.size}</td>
                            <td>
                                <div class="downloads-cell">
                                    <Icon icon="download" /> {dataset.downloads}
                                </div>
                            </td>
                            <td>
                                    <span class={`access ${dataset.access}`}>
                                        {dataset.access}
                                    </span>
                            </td>
                            <td>{dataset.lastUpdated}</td>
                            <td>
                                <Flexbox gap="0.5rem">
                                    <Button size="sm">
                                        <Icon icon="pencil" />
                                    </Button>
                                    <Button size="sm" onclick={() => toggleAccess(dataset.id)}>
                                        <Icon icon="lock" />
                                    </Button>
                                    <Button size="sm" --color="var(--color-danger)" onclick={() => deleteDataset(dataset.id)}>
                                        <Icon icon="trash" />
                                    </Button>
                                </Flexbox>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>

                {#if filteredDatasets.length === 0}
                    <div class="no-results">
                        <Icon icon="folder" size="3x" />
                        <p>No datasets found matching your criteria</p>
                    </div>
                {/if}
            </div>
        </Card>
    </Section>

    <Section>
        <Row>
            <Col>
                <Card fit>
                    <h3>Dataset Statistics</h3>
                    <div class="stat-card">
                        <div class="stat-value">{datasets.length}</div>
                        <div class="stat-label">Total Datasets</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{datasets.reduce((sum, ds) => sum + ds.downloads, 0)}</div>
                        <div class="stat-label">Total Downloads</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{datasets.filter(ds => ds.access === 'public').length}</div>
                        <div class="stat-label">Public Datasets</div>
                    </div>
                </Card>
            </Col>
            <Col>
                <Card fit>
                    <h3>Access Distribution</h3>
                    <div class="chart-container">
                        <div class="chart-bar">
                            <div class="chart-label">Public</div>
                            <div class="chart-bar-inner">
                                <div
                                        class="chart-bar-fill"
                                        style="width: {datasets.filter(ds => ds.access === 'public').length / datasets.length * 100}%"
                                ></div>
                                <div class="chart-bar-text">
                                    {Math.round(datasets.filter(ds => ds.access === 'public').length / datasets.length * 100)}%
                                </div>
                            </div>
                        </div>
                        <div class="chart-bar">
                            <div class="chart-label">Protected</div>
                            <div class="chart-bar-inner">
                                <div
                                        class="chart-bar-fill"
                                        style="width: {datasets.filter(ds => ds.access === 'protected').length / datasets.length * 100}%"
                                ></div>
                                <div class="chart-bar-text">
                                    {Math.round(datasets.filter(ds => ds.access === 'protected').length / datasets.length * 100)}%
                                </div>
                            </div>
                        </div>
                        <div class="chart-bar">
                            <div class="chart-label">Private</div>
                            <div class="chart-bar-inner">
                                <div
                                        class="chart-bar-fill"
                                        style="width: {datasets.filter(ds => ds.access === 'private').length / datasets.length * 100}%"
                                ></div>
                                <div class="chart-bar-text">
                                    {Math.round(datasets.filter(ds => ds.access === 'private').length / datasets.length * 100)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    </Section>
</Page>

<style>
    .table-container {
        overflow: hidden;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        padding: 15px;
        text-align: left;
        font-weight: 600;
        border-bottom: 1px solid var(--color-border-primary);
    }

    td {
        padding: 15px;
        border-bottom: 1px solid var(--color-border-primary);
        vertical-align: middle;
    }

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
</style>
