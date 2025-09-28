<script lang="ts">

    import type {Sized} from '$lib/client/helpers/sizes.helper';
    import type {Snippet} from 'svelte';

    let {fit = false, gutters = true, style, class: clzz, ...restProps}: {
        style?: string,
        fit?: boolean,
        gutters?: boolean,
        all?: number | 'auto' | 'none'
        class?: string,
        children?: Snippet
    } & Sized<number | 'auto' | 'none', true> = $props();

    const computedClass = $derived.by(() => {
        let _clzz = `row ${clzz ?? ''}`;
        if (restProps.all) {
            _clzz += ` row-cols-${restProps.all}`;
        }
        if (restProps.xs) {
            _clzz += ` row-cols-xs-${restProps.xs}`;
        }
        if (restProps.sm) {
            _clzz += ` row-cols-sm-${restProps.sm}`;
        }
        if (restProps.md) {
            _clzz += ` row-cols-md-${restProps.md}`;
        }
        if (restProps.lg) {
            _clzz += ` row-cols-lg-${restProps.lg}`;
        }
        if (restProps.xl) {
            _clzz += ` row-cols-xl-${restProps.xl}`;
        }
        if (restProps.xxl) {
            _clzz += ` row-cols-xxl-${restProps.xxl}`;
        }
        return _clzz;
    });

</script>

<div class={computedClass} class:fit class:no-gutters={!gutters} {style}>
    {@render restProps.children?.()}
</div>

<style lang="scss">
  @use "$lib/client/styles/mixins/responsive" as resp;

  .row {
    --default-gutter-x: 1.5rem;
    --default-gutter-y: 1.5rem;
    display: flex;
    row-gap: var(--gutter-y, var(--default-gutter-y));
    flex-wrap: wrap;
    margin-right: calc(-0.5 * var(--gutter-x, var(--default-gutter-x)));
    margin-left: calc(-0.5 * var(--gutter-x, var(--default-gutter-x)));

    &.no-gutters {
      --default-gutter-x: 0;
      --default-gutter-y: 0;
    }

    &.fit {
      height: 100%;
    }

    :global(> *) {
      box-sizing: border-box;
      flex-shrink: 0;
      width: 100%;
      max-width: 100%;
      padding-right: calc(var(--gutter-x, var(--default-gutter-x)) * 0.5);
      padding-left: calc(var(--gutter-x, var(--default-gutter-x)) * 0.5);
    }

    // Loop through breakpoints first, then define sizes within each breakpoint
    @each $breakpoint, $value in resp.$breakpoints {
      @include resp.min-width($breakpoint) {
        @for $i from 1 through 12 {
          &.row-cols-#{$breakpoint}-#{$i} {
            :global(> *) {
              display: revert;
              flex: 0 0 auto;
              width: calc(100% / #{$i}) !important;
            }
          }
        }

        // Define the auto and none classes for each breakpoint
        &.row-cols-#{$breakpoint}-auto {
          :global(> *) {
            display: revert;
            flex: 0 0 auto;
            width: auto !important;
          }
        }

        &.row-cols-#{$breakpoint}-none {
          :global(> *) {
            display: none;
          }
        }
      }
    }

    // Base row class without breakpoint-specific styles
    @for $i from 1 through 12 {
      &.row-cols-#{$i} {
        :global(> *) {
          display: block;
          flex: 0 0 auto;
          width: calc(100% / #{$i});
        }
      }
    }
  }
</style>
