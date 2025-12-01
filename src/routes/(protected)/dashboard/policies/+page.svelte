<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Table from "$lib/client/components/table/Table.svelte";
    import Item from "$lib/client/components/table/Item.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Dropdown from "$lib/client/components/Dropdown.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Modal from "$lib/client/components/Modal.svelte";
    import regoLang from "$lib/client/helpers/rego.lang";
    import MonacoEditor from "$lib/client/components/form/inputs/MonacoEditor.svelte";
    import TabLayout from "$lib/client/components/TabLayout.svelte";
    import Form from "$lib/client/components/form/Form.svelte";

    const {data} = $props();

    let testPolicyModal = $state<{
        show: boolean,
        policy?: { id: string, raw: string, result?: string, input?: string }
    }>({show: false})

</script>

<Page title="Policies">
    <Section>
        <Button href="policies/create">Create</Button>
    </Section>
    <Section>
        <Table columns={['State',"Name", "Dataset", '']}>
            {#await data.policies }
                <span>Loading policies...</span>
            {:then policies}
                {#each policies as policy}
                    <Item type="row">
                        <Item>
                            <Icon icon="circle-fill"
                                  --color={policy.active ? 'var(--color-success)' : 'var(--color-danger)'}/>
                        </Item>
                        <Item>
                            <a href="policies/{policy.id}">{policy.name}</a>
                        </Item>
                        <Item>
                            <Flexbox>
                                {#each policy.datasets as dataset}
                                    <Button href="/dashboard/datasets/{dataset.id}">{dataset.title}</Button>
                                {/each}
                            </Flexbox>
                        </Item>
                        <Item>
                            <Dropdown transparent>
                                <Button transparent href="policies/{policy.id}">
                                    <Icon icon="eye" margin="right"/>
                                    View
                                </Button>
                                <Button transparent onclick={() => testPolicyModal ={policy, show: true}}>
                                    <Icon icon="play" margin="right"/>
                                    Test
                                </Button>
                            </Dropdown>
                        </Item>
                    </Item>
                {/each}
            {/await}
        </Table>
    </Section>
</Page>

{#snippet policy()}
    <MonacoEditor language="rego" value={testPolicyModal.policy.raw} onmount={[regoLang]} style="min-height: 500px"
                  readOnly/>
{/snippet}
{#snippet execution()}
    <Form action="policies/{testPolicyModal.policy.id}?/test" onsuccess={({data}) => {
        testPolicyModal.policy.result = JSON.stringify(data);
    }}>
        <Flexbox direction="row">
            <input bind:value={testPolicyModal.policy.input} type="hidden" name="policy.input">
            <MonacoEditor language="json" style="min-height: 500px; min-width: 500px"
                          bind:value={testPolicyModal.policy.input}/>
            <MonacoEditor language="json" style="min-height: 500px; min-width: 500px"
                          value={testPolicyModal.policy.result} readOnly/>
        </Flexbox>
        <Button variant="success" type="submit">
            <Icon icon="play" margin="right"/>
            Test
        </Button>
    </Form>
{/snippet}

<Modal title="Test Policy" bind:show={testPolicyModal.show} --width="1500px">
    <TabLayout tabs={[
        {title: 'Rego Policy', content: policy},
        {title: 'Execution', content: execution}
    ]}/>
</Modal>

