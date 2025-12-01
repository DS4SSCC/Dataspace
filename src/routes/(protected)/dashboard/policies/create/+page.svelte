<script lang="ts">

    import Page from "$lib/client/components/Page.svelte";
    import TabLayout from "$lib/client/components/TabLayout.svelte";
    import MonacoEditor from "$lib/client/components/form/inputs/MonacoEditor.svelte";
    import Section from "$lib/client/components/Section.svelte";

    let policy = {
        '@context': 'http://www.w3.org/ns/odrl/2/',
        '@type': 'Policy',
        uid: '',
        profile: '',
        permissions: [{
            assigner: '',
            assignee: '',
            target: '',
            action: '',
            duties: []
        }]
    };

    const actions = ['use', 'read', 'write', 'execute', 'print', 'modify', 'distribute', 'reproduce'];
    const constraints = ['absolute-time', 'relative-time', 'count', 'spatial', 'industry', 'payment'];

    const addPermission = () => {
        policy.permissions.push({
            assigner: '',
            assignee: '',
            target: '',
            action: '',
            duties: [{
                action: '',
                constraints: []
            }]
        });
    };

    const removePermission = (index) => policy.permissions.splice(index, 1);

    const addDuty = (permIndex) => policy.permissions[permIndex].duties.push({
        action: '',
        constraints: []
    });

    const removeDuty = (permIndex, dutyIndex) => policy.permissions[permIndex].duties.splice(dutyIndex, 1);

    const addConstraint = (permIndex, dutyIndex) => policy.permissions[permIndex].duties[dutyIndex].constraints.push({
        leftOperand: '',
        operator: 'eq',
        rightOperand: ''
    });

    const removeConstraint = (permIndex, dutyIndex, constraintIndex) => policy.permissions[permIndex].duties[dutyIndex].constraints.splice(constraintIndex, 1);

    const operators = ['eq', 'gt', 'gteq', 'lt', 'lteq', 'neq', 'isA', 'hasPart', 'isPartOf', 'isAllOf', 'isAnyOf', 'isNoneOf'];

    // Clean policy for export (remove empty fields)
    const cleanPolicy = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(cleanPolicy).filter(item =>
                item !== null &&
                !(typeof item === 'object' && Object.keys(item).length === 0)
            );
        } else if (obj && typeof obj === 'object') {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== '' && value !== null && value !== undefined) {
                    cleaned[key] = cleanPolicy(value);
                }
            }
            return Object.keys(cleaned).length > 0 ? cleaned : null;
        }
        return obj;
    };

    const exportPolicy = () => {
        const cleaned = cleanPolicy(policy);
        if (!cleaned) return '{}';

        // Ensure required fields
        if (!cleaned.uid) cleaned.uid = 'http://example.com/policy#' + Date.now();
        if (!cleaned['@id']) cleaned['@id'] = cleaned.uid;

        return JSON.stringify(cleaned, null, 2);
    };

    $effect(() => {
        console.log('Current Policy:', exportPolicy());
    });

</script>

{#snippet builder()}

    <div class="container">
        <h1>ODRL Policy Builder</h1>

        <div class="card">
            <h2>Policy Metadata</h2>
            <label>
                Policy UID:
                <input bind:value={policy.uid} placeholder="http://example.com/policy/1" />
            </label>
            <label>
                Profile:
                <input bind:value={policy.profile} placeholder="http://example.com/profile" />
            </label>
        </div>

        {#each policy.permissions as permission, pIndex}
            <div class="card permission">
                <div class="card-header">
                    <h2>Permission {pIndex + 1}</h2>
                    <button type="button" onclick={() => removePermission(pIndex)} class="btn-remove">✕</button>
                </div>

                <label>
                    Assigner (optional):
                    <input bind:value={permission.assigner} placeholder="https://example.com/assigner" />
                </label>
                <label>
                    Assignee (optional):
                    <input bind:value={permission.assignee} placeholder="https://example.com/assignee" />
                </label>
                <label>
                    Target Asset:
                    <input bind:value={permission.target} placeholder="https://example.com/asset" />
                </label>
                <label>
                    Action:
                    <select bind:value={permission.action}>
                        <option value="">Select action</option>
                        {#each actions as action}
                            <option value={action}>{action}</option>
                        {/each}
                    </select>
                </label>

                <!-- Duties -->
                <div class="duties-section">
                    <h3>Duties</h3>
                    {#each permission.duties as duty, dIndex}
                        <div class="duty">
                            <div class="duty-header">
                                <h4>Duty {dIndex + 1}</h4>
                                <button type="button" onclick={() => removeDuty(pIndex, dIndex)} class="btn-remove">✕</button>
                            </div>
                            <label>
                                Duty Action:
                                <select bind:value={duty.action}>
                                    <option value="">Select action</option>
                                    {#each actions as action}
                                        <option value={action}>{action}</option>
                                    {/each}
                                </select>
                            </label>

                            <!-- Constraints -->
                            <div class="constraints">
                                <h4>Constraints</h4>
                                {#each duty.constraints as constraint, cIndex}
                                    <div class="constraint">
                                        <div class="constraint-fields">
                                            <input
                                                    bind:value={constraint.leftOperand}
                                                    placeholder="leftOperand"
                                                    list="constraint-left"
                                            />
                                            <select bind:value={constraint.operator}>
                                                {#each operators as op}
                                                    <option value={op}>{op}</option>
                                                {/each}
                                            </select>
                                            <input bind:value={constraint.rightOperand} placeholder="rightOperand" />
                                        </div>
                                        <button type="button" onclick={() => removeConstraint(pIndex, dIndex, cIndex)} class="btn-remove">✕</button>
                                    </div>
                                {/each}
                                <button type="button" onclick={() => addConstraint(pIndex, dIndex)} class="btn-add">
                                    + Add Constraint
                                </button>
                            </div>
                        </div>
                    {/each}
                    <button type="button" onclick={() => addDuty(pIndex)} class="btn-add">
                        + Add Duty
                    </button>
                </div>
            </div>
        {/each}

        <button onclick={addPermission} class="btn-primary">
            + Add Permission
        </button>

        <div class="output">
            <h2>Generated ODRL Policy</h2>
            <pre>{exportPolicy()}</pre>
        </div>
    </div>



    <datalist id="constraint-left">
        {#each constraints as c}
            <option value={c}>{c}</option>
        {/each}
    </datalist>
{/snippet}

{#snippet raw()}
    <h2>Settings</h2>
    <MonacoEditor style="height: auto"/>
{/snippet}

<Page>
    <Section>
        <TabLayout tabs={[
        {title:"Builder", content: builder},
        {title:"Raw", content: raw}
    ]} startIndex={1}/>
    </Section>
</Page>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: sans-serif;
    }

    .card {
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .permission {
        border-left: 4px solid #4a90e2;
    }

    .duty {
        background: #eef5ff;
        padding: 12px;
        border-radius: 6px;
        margin: 12px 0;
    }

    .duty-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .constraints {
        margin-top: 12px;
    }

    .constraint {
        display: flex;
        gap: 10px;
        margin: 8px 0;
        align-items: center;
    }

    .constraint-fields {
        display: flex;
        gap: 8px;
        flex: 1;
    }

    input, select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%;
        margin: 4px 0;
    }

    .constraint-fields input,
    .constraint-fields select {
        width: auto;
    }

    button {
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .btn-primary {
        background: #4a90e2;
        color: white;
        width: 100%;
        margin: 20px 0;
    }

    .btn-add {
        background: #5cb85c;
        color: white;
        width: 100%;
        margin: 8px 0;
    }

    .btn-remove {
        background: #d9534f;
        color: white;
        width: 24px;
        height: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .output {
        margin-top: 30px;
    }

    pre {
        background: #2d2d2d;
        color: #f8f8f2;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        white-space: pre-wrap;
    }
</style>
