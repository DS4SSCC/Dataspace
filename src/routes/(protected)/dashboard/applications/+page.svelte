<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Modal from "$lib/client/components/Modal.svelte";
    import Form from "$lib/client/components/form/Form.svelte";
    import Table from "$lib/client/components/table/Table.svelte";
    import Item from "$lib/client/components/table/Item.svelte";
    import {goto} from "$app/navigation";
    import {copyToClipboard} from "$lib/client/helpers/clipboard.helper";

    let {data} = $props();

    let addApplicationModal = $state({
        show: false,
        name: "",
        description: "",
        inbox_url: "",
    });
</script>

<Page title="Applications" description="Connect your own application with this dataspace.">
    {#snippet suffix()}
        <Button variant="primary" style="white-space: nowrap" onclick={()=> addApplicationModal.show = true}>
            <Icon icon="plus-lg" margin="right"/>
            Add Application
        </Button>
    {/snippet}
    <!-- Search Section -->
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
    <!-- Applications Section-->
    <Section>
        <Card>
            <Table>
                {#snippet head()}
                    <Item type="row">
                        <Item type="header">Name</Item>
                        <Item type="header">API-Key</Item>
                        <Item type="header">LDN Inbox</Item>
                    </Item>
                {/snippet}
                {#each data.applications as application}
                    <Item type="row">
                        <Item onclick={() => goto(`/dashboard/applications/${application.id}`)} style="cursor: pointer">
                            <Flexbox direction="column">
                                <span style="font-weight: 500">{application.name}</span>
                                <span style="font-size: small; display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;">{application.description}</span>
                            </Flexbox>
                        </Item>
                        <Item>
                            <Flexbox gap=".5rem">
                                <Input type="text" value={application.api_key} --mb="0" wrapperStyle="flex: 1"></Input>
                                <Button onclick={() => copyToClipboard(application.api_key)}><Icon icon="clipboard"/></Button>
                            </Flexbox>
                        </Item>
                        <Item>
                            <Flexbox gap=".5rem" align="center">
                                <span>{application.inbox_url}</span>
                                <Form action="/dashboard/applications/{application.id}?/testInbox">
                                    <Button type="submit">Test</Button>
                                </Form>
                            </Flexbox>
                        </Item>
                    </Item>
                {/each}
            </Table>
        </Card>
    </Section>
<!--    <pre>{JSON.stringify(data.applications, null, 2)}</pre>-->
</Page>

<Modal title="Add Application" bind:show={addApplicationModal.show}>
    <Form id="add-application-form" action="?/create">
        <Input type="text" name="application.name" label="Name" placeholder="My Application" required/>
        <Input type="textarea" name="application.description" label="Description"/>
        <Input type="url"
               name="application.inbox_url"
               label="Inbox URL"
               description="Enter your LDN inbox URL to receive automatic notifications via Linked Data Notifications (LDN)."
               placeholder="https://my-application.com/inbox"
        />
    </Form>
    {#snippet footer()}
        <Flexbox justify="flex-end">
            <Button transparent onclick={()=> addApplicationModal.show = false}>Close</Button>
            <Button variant="primary" type="submit" form="add-application-form">
                <Icon icon="plus-lg" margin="right"/>
                Add Application
            </Button>
        </Flexbox>
    {/snippet}
</Modal>
