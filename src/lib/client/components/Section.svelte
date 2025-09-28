<script lang="ts">
    import type {Snippet} from "svelte";

    interface Props {
        fit?: boolean | number;
        id?: string | null;
        style?: string | null;
        padding?: boolean;
        breakpoints?: boolean,
        type?: string;
        children?: Snippet;
        class?: string
    }

    let {
        fit = false,
        id = null,
        style = null,
        padding = true,
        breakpoints = false,
        type = "section",
        children,
        ...rest
    }: Props = $props();
</script>

<svelte:element class={rest.class} this={type} class:fit class:padding class:breakpoints {id}
                style="{typeof fit === 'number' ? `height:${100 * fit}%;` : ''}{style ?? ''}">
    {@render children?.()}
</svelte:element>

<style lang="scss">
  @use "sass:map";
  @use "$lib/client/styles/mixins/responsive" as resp;
  @use "$lib/client/styles/base/variables" as variables;

  .padding {
    padding-left: 12px;
    padding-right: 12px;
    @include resp.min-width(md) {
      padding-left: 24px;
      padding-right: 24px;
    }
  }

  .breakpoints {
    justify-self: center;
    width: 100%;
    @each $breakpoint, $max-width in variables.$section-max-widths {
      @include resp.min-width(#{$breakpoint}) {
        max-width: $max-width;
      }
    }
  }

  .fit {
    height: 100%;
  }

  :not(:global(:last-child)) {
    margin-bottom: map.get(variables.$spacings, "lg");
  }
</style>
