<script lang="ts">
    import type {Snippet} from "svelte";
    import Card from "$lib/client/components/Card.svelte";

    let {title, value, suffix}:{
        title: string,
        value: string,
        suffix?: Snippet
    } = $props();
</script>

<Card class="analytics-value-card">
    <h6 class="title">{title}</h6>
    <h1 class="value">{value}</h1>
    {#if suffix?.()}
        <div class="suffix">
            {@render suffix?.()}
        </div>
    {/if}
</Card>

<style lang="scss">
    :global(.analytics-value-card){
      .title{
        color: var(--color-text-secondary);
      }
      .value{
        margin-bottom: 0;
      }
      .suffix{
        margin-top: 1rem;
      }
    }
</style>
