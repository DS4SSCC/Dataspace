<script lang="ts">
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    let { sector, ...restProps } = $props();

    const sectorIcons: Record<string, string> = {
        "sector-mobility": "truck",
        "sector-energy": "lightning-charge",
        "sector-environment": "tree",
        "sector-waste": "recycle",
        "sector-health": "heart-pulse",
        "sector-safety": "shield-lock",
        "sector-housing": "house-door",
        "sector-economy": "graph-up-arrow",
        "sector-culture": "book-half",
        "sector-governance": "bank",
        "sector-debugging": "bug-fill"
    };
</script>

<Button class="sector-btn {sector?.id}" {...restProps}>
    {#if sector}
        <Icon icon={sectorIcons[sector.id]} margin="right" />
        {sector.name}
    {/if}
</Button>

<style lang="scss">
  @use "$lib/client/styles/sectors" as sectors;

  @each $id, $color in sectors.$sector-colors {
    :global(.sector-btn.#{$id}) {
      --bg: #{$color};
      --text: #{sectors.text-color($color)};
      --border: 1px solid #{sectors.border-color($color)};
    }
  }
</style>
