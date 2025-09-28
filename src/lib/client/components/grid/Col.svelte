<script lang="ts">
	import type { Sized } from '$lib/client/helpers/sizes.helper';
	import type { Snippet } from 'svelte';

	let {
		fit = false,
		animate = true,
		children,
		class: clzz, ...restProps }: {
		fit?: boolean,
		animate?: boolean,
		class?: string,
		style?: string,
		children?: Snippet
	} & Sized<number | 'auto' | null, true> = $props();

	const computedClass = $derived.by(() => {
		let _clzz = `col ${clzz ?? ''}`;
		if (restProps.xs) {
			_clzz += ` col-${restProps.xs}`;
		}
		if (restProps.sm) {
			_clzz += ` col-sm-${restProps.sm}`;
		}
		if (restProps.md) {
			_clzz += ` col-md-${restProps.md}`;
		}
		if (restProps.lg) {
			_clzz += ` col-lg-${restProps.lg}`;
		}
		if (restProps.xl) {
			_clzz += ` col-xl-${restProps.xl}`;
		}
		if (restProps.xxl) {
			_clzz += ` col-xxl-${restProps.xxl}`;
		}
		return _clzz
	});
</script>
<div class={computedClass} class:fit class:animate style={restProps.style??''}>
	{@render children?.()}
</div>

<style lang="scss">
  @use '$lib/client/styles/mixins/animations' as anim;
  @use '$lib/client/styles/mixins/responsive' as resp;

  .col {
    flex: 1 0 0;

    &.animate {
      @include anim.fade-in-up();
    }

    &.fit {
      height: 100%;
    }

    &.col-auto {
      flex: 0 0 auto;
      width: auto;
    }

    &.col-none {
      display: none;
    }

    // Iterate over each breakpoint first, then define sizes within it
    @each $breakpoint, $value in resp.$breakpoints {
      @include resp.min-width($breakpoint) {
        @for $i from 1 through 12 {
          &.col-#{$breakpoint}-#{$i} {
            display: block;
            flex: 0 0 auto;
            width: calc(#{$i} * 8.33333333%) !important;
          }
        }

        // Define the auto and none classes for each breakpoint
        &.col-#{$breakpoint}-auto {
          display: block;
          flex: 0 0 auto;
          width: auto !important;
        }

        &.col-#{$breakpoint}-none {
          display: none;
        }
      }
    }

    // Base column class without breakpoint-specific styles
    @for $i from 1 through 12 {
      &.col-#{$i} {
        flex: 0 0 auto;
        width: calc(#{$i} * 8.33333333%);
      }
    }
  }
</style>
