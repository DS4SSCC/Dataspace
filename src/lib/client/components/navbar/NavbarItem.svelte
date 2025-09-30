<script lang="ts">
    import type {Snippet} from "svelte";
    import {page} from "$app/state";

    let {href, onclick, children, exact = false, ...rest}:{
        href?: string;
        onclick?: (e: any) => void;
        children?: Snippet;
        exact?: boolean;
    } = $props();

    let isActive = $derived(exact ? page.url.pathname === href : href ? page.url.pathname.includes(href) : false);
</script>

{#if href}
    <a class="navbar-item" type="button" {href} {onclick} class:active={isActive}>
        {@render children?.()}
    </a>
{:else}
    <button class="navbar-item" type="button" {onclick}>
        {@render children?.()}
    </button>
{/if}

<style lang="scss">
    $navbar-item-padding: 1rem .5rem;

    .navbar-item{
      position: relative;
      display: inline-flex;
      color: var(--color-inactive, var(---color-text-secondary));
      text-decoration: none;
      padding: $navbar-item-padding;
      align-items: center;
      font-weight: 500;
      transition: .15s;

      &.active{
        color: var(--color, var(--color-text-primary));

        &:after{
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--color-active, var(--color-text-primary));
          transform: translateY(1px);
        }
      }

      &:hover{
        color: var(--color, var(--color-text-primary));
      }

    }
</style>

