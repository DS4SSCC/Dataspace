<script lang="ts">
import type {Snippet} from "svelte";

let {show = $bindable(), sidebar, children}:{
    show: boolean,
    sidebar: Snippet
    children: Snippet
} = $props();
</script>

<div class="sidebar-layout" class:visible={show}>
    <div class="sidebar">
        {@render sidebar()}
    </div>
    {@render children()}
</div>

<style lang="scss">
  @use "$lib/client/styles/mixins/responsive" as responsive;

  .sidebar-layout {
    $sidebar-width: 350px;
    position: relative;
    padding-top: calc(70px + 2rem);

    @include responsive.min-width(md) {
      padding-left: 2rem;
    }

    .sidebar {
      width: 350px;
      position: fixed;
      left: calc($sidebar-width * -1);
      transition: .5s;
    }

    :global(.page) {
      flex: 1;
      padding-top: 0;
    }

    &.visible {
      --offset-left: 350px;

      .sidebar {
        left: 2rem;
      }
    }
  }
</style>
