<script lang="ts">
    import type {Snippet} from "svelte";
    import Section from "$lib/client/components/Section.svelte";

    let { children, title, description, prefix, suffix }:{
        title?: string,
        description?: string,
        prefix?: Snippet
        suffix?: Snippet
        children?: Snippet
    } = $props();
</script>

<div class="page">
    {#if title}
        <Section>
            <header>
                <div>
                    {@render prefix?.()}
                    <h1>{title}</h1>
                    {#if description}<p>{description}</p>{/if}
                </div>
                {@render suffix?.()}
            </header>
        </Section>
    {/if}
    {@render children?.()}
</div>

<style>
    .page{
        padding-top: calc(70px + 1.5rem);
        padding-left: 2rem;
        padding-right: 2rem;
        padding-bottom: 70px;
        header{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
            p{ color: var(--color-text-secondary)}
        }
    }
</style>
