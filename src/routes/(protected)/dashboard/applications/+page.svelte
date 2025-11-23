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
    import SectionHeader from "$lib/client/components/SectionHeader.svelte";
    import Modal from "$lib/client/components/Modal.svelte";
    import Form from "$lib/client/components/form/Form.svelte";

    let addApplicationModal = $state({
        show: false,
        name: "",
        description: "",
        inbox_url: "",
    })
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
    <!-- API-Keys Section-->
    <Section>

    </Section>
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
            <Button variant="primary" type="submit" form="add-application-form"><Icon icon="plus-lg" margin="right"/>Add Application</Button>
        </Flexbox>
    {/snippet}
</Modal>
