<script lang="ts">
    import BrandIcon from "$lib/client/components/icons/BrandIcon.svelte";
    import type {Snippet} from "svelte";

    let {children, ...rest}:{
        children?: Snippet
    } = $props();
</script>
<div class="navbar" {...rest}>
    <div class="navbar-brand">
        <BrandIcon --width="45px" --color="var(--color-text-primary)" />
    </div>
    <div class="navbar-content">
        {@render children?.()}
    </div>
</div>

<style lang="scss">
  $navbar-padding: .75rem 2rem;

  .navbar {
    display: flex;
    border-bottom: solid 1px var(--color-border-primary);
    align-items: stretch;
    background: var(--bg, transparent);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 99;
    color: white;
    .navbar-brand {
      padding: $navbar-padding;
      border-right: solid 1px var(--color-border-primary);
    }
    .navbar-content{
      flex: 1;

    }
  }
</style>
