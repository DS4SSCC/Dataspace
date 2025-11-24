<script>
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Card from "$lib/client/components/Card.svelte";

    let {data} = $props();
</script>

<Page title={data.application.name} description={data.application.description}>
    <Section>
        <Card>

        </Card>
    </Section>
</Page>
