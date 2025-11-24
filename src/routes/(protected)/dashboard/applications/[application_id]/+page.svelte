<script>
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Form from "$lib/client/components/form/Form.svelte";

    let {data} = $props();
</script>

<Page title={data.application.name} description={data.application.description} previous_label="Applications" previous_href="/dashboard/applications">
    <Section style="text-align: right">
        <Form action="?/remove">
            <Button variant="danger" type="submit"><Icon icon="trash-fill" margin="right"/>Remove</Button>
        </Form>
    </Section>
    <Section>
        <Card>
            <pre>{JSON.stringify(data.application, null, 2)}</pre>
        </Card>
    </Section>
</Page>
