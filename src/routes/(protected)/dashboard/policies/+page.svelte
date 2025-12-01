<script>
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";

    const {data} = $props();

</script>

<Page title="Policies">
    <Section>
        <Button href="policies/create">Create</Button>
    </Section>
    <Section>
        {#await data.policies }
            <span>Loading policies...</span>
        {:then policies}
            <table>
                <tbody>
                {#each policies as policy}
                    <tr>
                        <td>
                            {policy.name}
                        </td>
                        <td>
                            {policy.description}
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        {/await}
    </Section>
</Page>
