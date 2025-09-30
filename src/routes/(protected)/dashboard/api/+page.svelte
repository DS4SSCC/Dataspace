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
    import AnalyticsValueCard from "$lib/client/components/cards/AnalyticsValueCard.svelte";

    // API keys data
    let apiKeys = [
        {
            id: 'key-1',
            name: 'Production App',
            key: '1234567890abcdef',
            created: '2025-05-15',
            lastUsed: '2025-9-20',
            status: 'active',
            permissions: ['read', 'write']
        },
        {
            id: 'key-2',
            name: 'Development',
            key: '0987654321fedcba',
            created: '2025-07-22',
            lastUsed: '2025-9-18',
            status: 'active',
            permissions: ['read']
        },
        {
            id: 'key-3',
            name: 'Analytics Service',
            key: '5555666677778888',
            created: '2025-09-01',
            lastUsed: '2025-9-05',
            status: 'revoked',
            permissions: ['read']
        }
    ];

    // Form state
    let newKeyName = '';
    let newKeyPermissions = ['read'];
    let showCreateForm = false;
    let copiedKey = null;
    let filterStatus = 'all';
    let searchTerm = '';

    // API usage statistics
    let usageStats = {
        totalRequests: 12485,
        requestsToday: 342,
        avgResponseTime: 142,
        successRate: 98.7
    };

    // Toggle API key status
    function toggleStatus(id) {
        const key = apiKeys.find(k => k.id === id);
        if (key) {
            key.status = key.status === 'active' ? 'revoked' : 'active';
        }
    }

    // Revoke API key
    function revokeKey(id) {
        const key = apiKeys.find(k => k.id === id);
        if (key) {
            key.status = 'revoked';
        }
    }

    // Copy API key to clipboard
    async function copyKey(key) {
        try {
            await navigator.clipboard.writeText(key);
            copiedKey = key;
            setTimeout(() => copiedKey = null, 2000);
        } catch (err) {
            console.error('Failed to copy key: ', err);
        }
    }

    // Create new API key
    function createKey() {
        if (!newKeyName.trim()) return;

        const newKey = {
            id: `key-${Date.now()}`,
            name: newKeyName,
            key: `sk_${Math.random().toString(36).substring(2, 18)}`,
            created: new Date().toISOString().split('T')[0],
            lastUsed: 'Never',
            status: 'active',
            permissions: [...newKeyPermissions]
        };

        apiKeys = [newKey, ...apiKeys];
        newKeyName = '';
        newKeyPermissions = ['read'];
        showCreateForm = false;
    }

    // Filter API keys based on status and search term
    $: filteredKeys = apiKeys.filter(key => {
        const matchesStatus = filterStatus === 'all' || key.status === filterStatus;
        const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            key.key.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
</script>

<Page title="API Key Management" description="Manage your API keys and monitor usage">
    {#snippet suffix()}
        <Button variant="primary">
            <Icon icon="plus-lg" margin="right"/>
            Create API Key
        </Button>
    {/snippet}
    <Section>
        <Row>
            <Col>
                <AnalyticsValueCard title="Total Requests" value={usageStats.totalRequests.toLocaleString()}/>
            </Col>
            <Col>
                <AnalyticsValueCard title="Requests Today" value={usageStats.requestsToday.toString()}/>
            </Col>
            <Col>
                <AnalyticsValueCard title="Avg. Response Time" value="{usageStats.avgResponseTime}ms"/>
            </Col>
            <Col>
                <AnalyticsValueCard title="Success Rate" value="{usageStats.successRate}%"/>
            </Col>
        </Row>
    </Section>
    <Section>
        <Flexbox justify="space-between" columnGap="1rem">
            <Card style="flex: 1"><Input type="text" placeholder="Search keys..." --bg="transparent" --border="none"/>
            </Card>
            <Card><Input type="select"
                         --bg="transparent"
                         --border="none"
                         options={[{label: "All", value: 'all'}, {label: "Active", value: 'active'}, {label: "Revoked", value: 'revoked'}]}
            /></Card>
        </Flexbox>
    </Section>
    <Section>
        <Card>
            <div class="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Key Name</th>
                        <th>Key</th>
                        <th>Created</th>
                        <th>Last Used</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each filteredKeys as key}
                        <tr>
                            <td>{key.name}</td>
                            <td class="key-cell">
                                <Input type="text" value={key.key} --mb="0"></Input>
                                <Button onclick={() => copyKey(key.key)}>
                                    <Icon icon={copiedKey === key.key ? 'clipboard-check' : 'clipboard'}/>
                                </Button>
                            </td>
                            <td>{key.created}</td>
                            <td>{key.lastUsed}</td>
                            <td>
            <span class={`status ${key.status}`}>
              {key.status}
            </span>
                            </td>
                            <td>
                                <Button --text={key.status === 'active' ? 'var(--color-danger)' : 'var(--color-success)'} size="sm"
                                        onclick={() => toggleStatus(key.id)}>
                                    {key.status === 'active' ? 'Revoke' : 'Activate'}
                                </Button>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>

                {#if filteredKeys.length === 0}
                    <div class="no-results">
                        <p>No API keys found matching your criteria</p>
                    </div>
                {/if}
            </div>
        </Card>

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
    }

    .key-cell {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #aaa;
    }

    .info-section h2 {
        margin-top: 0;
        color: #4da6ff;
        margin-bottom: 15px;
    }

    .info-section ul {
        padding-left: 20px;
    }

    .info-section li {
        margin-bottom: 10px;
        line-height: 1.5;
    }

    @media (max-width: 768px) {
        header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
        }
    }
</style>
