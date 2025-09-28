<script lang="ts">
    import type {Snippet} from "svelte";

    let { children, title, description, suffix }:{
        title?: string,
        description?: string,
        suffix?: Snippet
        children?: Snippet
    } = $props();
</script>

<div class="page">
    {#if title}
        <header>
            <div>
                <h1>{title}</h1>
                {#if description}<p>{description}</p>{/if}
            </div>
            {@render suffix?.()}
        </header>
    {/if}
    {@render children?.()}
</div>

<style>
    .page{
        padding-top: 70px;
        padding-left: 2rem;
        padding-right: 2rem;
        header{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
            p{ color: var(--color-text-secondary)}
        }
    }
</style>
