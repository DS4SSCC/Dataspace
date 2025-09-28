<script>
    import {onMount} from 'svelte';
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Input from "$lib/client/components/form/Input.svelte";

    // Dataset request data
    let datasetRequests = [
        {
            id: 'req-1',
            dataset: 'COVID-19 Statistics',
            requester: 'researcher@university.edu',
            reason: 'Academic research on pandemic trends',
            status: 'approved',
            requested: '2023-10-15',
            approved: '2023-10-16',
            expires: '2024-10-16'
        },
        {
            id: 'req-2',
            dataset: 'Financial Market Data',
            requester: 'data@company.com',
            reason: 'For developing trading algorithms',
            status: 'pending',
            requested: '2023-10-18',
            approved: null,
            expires: null
        },
        {
            id: 'req-3',
            dataset: 'Weather Patterns',
            requester: 'climate@agency.gov',
            reason: 'Climate modeling research',
            status: 'rejected',
            requested: '2023-10-10',
            approved: null,
            expires: null
        },
        {
            id: 'req-4',
            dataset: 'Population Census',
            requester: 'stats@org.net',
            reason: 'Demographic analysis project',
            status: 'approved',
            requested: '2023-10-05',
            approved: '2023-10-06',
            expires: '2024-10-06'
        },
        {
            id: 'req-5',
            dataset: 'Economic Indicators',
            requester: 'analytics@firm.com',
            reason: 'Economic forecasting model',
            status: 'pending',
            requested: '2023-10-20',
            approved: null,
            expires: null
        }
    ];

    // Filters
    let searchTerm = '';
    let filterStatus = 'all';
    let sortBy = 'requested';

    // Filter and sort requests
    $: filteredRequests = datasetRequests
        .filter(request => {
            const matchesSearch = request.dataset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.reason.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'requested') return new Date(b.requested) - new Date(a.requested);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            if (sortBy === 'dataset') return a.dataset.localeCompare(b.dataset);
            return 0;
        });

    // Update request status
    function updateStatus(id, newStatus) {
        const request = datasetRequests.find(r => r.id === id);
        if (request) {
            request.status = newStatus;
            if (newStatus === 'approved') {
                request.approved = new Date().toISOString().split('T')[0];
                request.expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            }
        }
    }

    // Delete request
    function deleteRequest(id) {
        datasetRequests = datasetRequests.filter(r => r.id !== id);
    }
</script>

<Page title="Dataset Access Requests" description="Manage access requests for your datasets">
    {#snippet suffix()}
        <Button variant="primary">
            <Icon icon="download" margin="right"/>
            Export Requests
        </Button>
    {/snippet}

    <Section>
        <Flexbox justify="space-between" align="center" gap="1rem">
            <Card style="flex: 1">
                <Input
                        type="text"
                        placeholder="Search requests..."
                        bind:value={searchTerm}
                        --bg="transparent"
                        --border="none"
                />
            </Card>
            <Card>
                <Input
                        type="select"
                        bind:value={filterStatus}
                        --bg="transparent"
                        --border="none"
                        options={[
                        {label: "All Status", value: 'all'},
                        {label: "Pending", value: 'pending'},
                        {label: "Approved", value: 'approved'},
                        {label: "Rejected", value: 'rejected'}
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
                        {label: "Sort by Date", value: 'requested'},
                        {label: "Status", value: 'status'},
                        {label: "Dataset", value: 'dataset'}
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
                        <th>Requester</th>
                        <th>Reason</th>
                        <th>Requested</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each filteredRequests as request}
                        <tr>
                            <td>
                                <div class="dataset-cell">
                                    <div class="dataset-icon">
                                        <Icon icon="file-earmark" />
                                    </div>
                                    <div>
                                        <div class="dataset-name">{request.dataset}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="requester-cell">
                                    <div class="requester-avatar">
                                        {request.requester.charAt(0).toUpperCase()}
                                    </div>
                                    <div>{request.requester}</div>
                                </div>
                            </td>
                            <td class="reason-cell">{request.reason}</td>
                            <td>{request.requested}</td>
                            <td>
                                    <span class={`status ${request.status}`}>
                                        {request.status}
                                    </span>
                            </td>
                            <td>
                                <Flexbox gap="0.5rem">
                                    {#if request.status === 'pending'}
                                        <Button
                                                variant="success"
                                                size="sm"
                                                on:click={() => updateStatus(request.id, 'approved')}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                                variant="danger"
                                                size="sm"
                                                on:click={() => updateStatus(request.id, 'rejected')}
                                        >
                                            Reject
                                        </Button>
                                    {/if}
                                    {#if request.status === 'approved'}
                                        <Button
                                                variant="secondary"
                                                size="sm"
                                                on:click={() => updateStatus(request.id, 'rejected')}
                                        >
                                            Revoke
                                        </Button>
                                    {/if}
                                    <Button
                                            variant="danger"
                                            size="sm"
                                            on:click={() => deleteRequest(request.id)}
                                    >
                                        <Icon icon="trash" />
                                    </Button>
                                </Flexbox>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>

                {#if filteredRequests.length === 0}
                    <div class="no-results">
                        <Icon icon="folder" size="3x" />
                        <p>No access requests found matching your criteria</p>
                    </div>
                {/if}
            </div>
        </Card>
    </Section>

    <Section>
        <Row>
            <Col width="4">
                <Card>
                    <h3>Request Summary</h3>
                    <div class="stat-card">
                        <div class="stat-value">{datasetRequests.length}</div>
                        <div class="stat-label">Total Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{datasetRequests.filter(r => r.status === 'pending').length}</div>
                        <div class="stat-label">Pending Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{datasetRequests.filter(r => r.status === 'approved').length}</div>
                        <div class="stat-label">Approved Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">{datasetRequests.filter(r => r.status === 'rejected').length}</div>
                        <div class="stat-label">Rejected Requests</div>
                    </div>
                </Card>
            </Col>
            <Col width="8">
                <Card>
                    <h3>Status Distribution</h3>
                    <div class="chart-container">
                        <div class="chart-bar">
                            <div class="chart-label">Pending</div>
                            <div class="chart-bar-inner">
                                <div
                                        class="chart-bar-fill pending"
                                        style="width: {datasetRequests.filter(r => r.status === 'pending').length / datasetRequests.length * 100}%"
                                ></div>
                                <div class="chart-bar-text">
                                    {Math.round(datasetRequests.filter(r => r.status === 'pending').length / datasetRequests.length * 100)}%
                                </div>
                            </div>
                        </div>
                        <div class="chart-bar">
                            <div class="chart-label">Approved</div>
                            <div class="chart-bar-inner">
                                <div
                                        class="chart-bar-fill approved"
                                        style="width: {datasetRequests.filter(r => r.status === 'approved').length / datasetRequests.length * 100}%"
                                ></div>
                                <div class="chart-bar-text">
                                    {Math.round(datasetRequests.filter(r => r.status === 'approved').length / datasetRequests.length * 100)}%
                                </div>
                            </div>
                        </div>
                        <div class="chart-bar">
                            <div class="chart-label">Rejected</div>
                            <div class="chart-bar-inner">
                                <div
                                        class="chart-bar-fill rejected"
                                        style="width: {datasetRequests.filter(r => r.status === 'rejected').length / datasetRequests.length * 100}%"
                                ></div>
                                <div class="chart-bar-text">
                                    {Math.round(datasetRequests.filter(r => r.status === 'rejected').length / datasetRequests.length * 100)}%
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

    .dataset-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .dataset-icon {
        background: var(--color-background-tertiary);
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-primary);
    }

    .dataset-name {
        font-weight: 500;
    }

    .requester-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .requester-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
    }

    .reason-cell {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .status {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .status.pending {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
    }

    .status.approved {
        background: rgba(118, 210, 117, 0.2);
        color: #76d275;
    }

    .status.rejected {
        background: rgba(255, 100, 100, 0.2);
        color: #ff6464;
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
        transition: width 0.5s ease;
    }

    .chart-bar-fill.pending {
        background: #ffc107;
    }

    .chart-bar-fill.approved {
        background: #76d275;
    }

    .chart-bar-fill.rejected {
        background: #ff6464;
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
