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

    // API keys data
    let apiKeys = [
        {
            id: 'key-1',
            name: 'Production App',
            key: 'sk_1234567890abcdef',
            created: '2023-05-15',
            lastUsed: '2023-10-20',
            status: 'active',
            permissions: ['read', 'write']
        },
        {
            id: 'key-2',
            name: 'Development',
            key: 'sk_0987654321fedcba',
            created: '2023-07-22',
            lastUsed: '2023-10-18',
            status: 'active',
            permissions: ['read']
        },
        {
            id: 'key-3',
            name: 'Analytics Service',
            key: 'sk_5555666677778888',
            created: '2023-09-01',
            lastUsed: '2023-10-05',
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
                <Card>
                    <h1>{usageStats.totalRequests.toLocaleString()}</h1>
                    <span>Total Requests</span>
                </Card>
            </Col>
            <Col>
                <Card>
                    <h1>2,845</h1>
                    <span>{usageStats.requestsToday}</span>
                </Card>
            </Col>
            <Col>
                <Card>
                    <h1>{usageStats.avgResponseTime}ms</h1>
                    <span>Avg. Response Time</span>
                </Card>
            </Col>
            <Col>
                <Card>
                    <h1>{usageStats.successRate}%</h1>
                    <span>Success Rate</span>
                </Card>
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
                                <code class="key-display">{key.key}</code>
                                <Button
                                        class="copy-btn"
                                        onclick={() => copyKey(key.key)}
                                        title="Copy to clipboard"
                                >
                                    {copiedKey === key.key ? 'Copied!' : 'Copy'}
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
                                <button
                                        class={`status-btn ${key.status === 'active' ? 'revoke' : 'activate'}`}
                                        on:click={() => toggleStatus(key.id)}
                                >
                                    {key.status === 'active' ? 'Revoke' : 'Activate'}
                                </button>
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

    .key-display {
        font-family: monospace;
        background: var(--color-background-tertiary);
        border: solid 1px var(--color-border-primary);
        padding: 5px 10px;
        border-radius: 8px;
        font-size: 0.9rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .status {
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
    }

    .status.active {
        background: rgba(118, 210, 117, 0.2);
        color: #76d275;
    }

    .status.revoked {
        background: rgba(255, 100, 100, 0.2);
        color: #ff6464;
    }

    .status-btn {
        padding: 6px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s;
    }

    .status-btn.revoke {
        background: rgba(255, 100, 100, 0.2);
        color: #ff6464;
    }

    .status-btn.revoke:hover {
        background: rgba(255, 100, 100, 0.4);
    }

    .status-btn.activate {
        background: rgba(118, 210, 117, 0.2);
        color: #76d275;
    }

    .status-btn.activate:hover {
        background: rgba(118, 210, 117, 0.4);
    }

    .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #aaa;
    }

    .info-section {
        background: rgba(30, 40, 50, 0.7);
        border-radius: 10px;
        padding: 25px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

        .controls {
            flex-direction: column;
        }

        .key-display {
            max-width: 100px;
        }
    }
</style>
