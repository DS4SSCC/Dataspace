<script lang="ts" module>

    import type {Snippet} from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    export type ButtonProps = {
        round?: boolean
        badge?: boolean
        transparent?: boolean
        block?: boolean,
        href?: string,
        exact?: boolean,
        active?: boolean
        padding?: boolean
        loading?: boolean
        disabled?: boolean
        type?: HTMLButtonAttributes['type'],
        class?: string,
        form?: string
        size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl',
        variant?: 'primary' | 'secondary' | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'transparent',
        children?: Snippet<[{ hover: boolean }]>
        [key: string]: any
    }

</script>

<script lang="ts">
    import {onMount} from 'svelte';
    import {page} from '$app/state';

    let {
        round = false,
        badge = false,
        transparent = false,
        block = false,
        href = undefined,
        exact = true,
        active = $bindable(false),
        padding = true,
        loading = false,
        disabled = false,
        onclick,
        onmouseenter,
        onmouseleave,
        onClickOutside,
        class: clzz,
        size = 'md',
        variant = undefined,
        children,
        ...restProps
    }: ButtonProps = $props();


    let hover = $state<boolean>(false);

    onMount(() => {
        active = exact ? page.url.pathname === href : href ? page.url.pathname.includes(href) : false;
    });

    $effect(() => {
        active = exact ? page.url.pathname === href : href ? page.url.pathname.includes(href) : false;
    });

    let classList = $derived.by(() => {
        let classList = [];
        if (clzz) classList.push(clzz);
        if (size) classList.push(size);
        if (variant) classList.push(variant);
        if (active) classList.push('active');
        if (transparent) classList.push('transparent');
        if (round) classList.push('round');
        if (badge) classList.push('badge');
        if (block) classList.push('block');
        if (!padding) classList.push('no-padding');
        if (loading) classList.push('loading');
        if (!href && !onclick && restProps.type !== 'submit') classList.push('no-action');
        return classList.join(' ');
    });
</script>

<svelte:element this={href ? 'a' : 'button'}
                role={href ? 'link' : null}
                type={restProps.type || 'button'}
                class={classList}
                {href}
                disabled={disabled || loading || null}
                onmouseenter={(event:MouseEvent) => {
                   onmouseenter?.(event);
                   hover = true;
                }}
                onmouseleave={(event:MouseEvent) => {
                   onmouseleave?.(event);
                   hover = false;
                }}
                {onclick}
                {...restProps}>
    {@render children?.({hover})}
</svelte:element>

<style lang="scss">
  @use "sass:map";

  $button-sizes: (
          xs: (padding: 2px 10px, font-size: 12px, border-radius: 1rem),
          sm: (padding: 6px 12px, font-size: 12px, border-radius: 1rem),
          md: (padding: 8px 12px, font-size: 14px, border-radius: 1rem),
          lg: (padding: 12px 16px, font-size: 16px, border-radius: 1rem),
          xl: (padding: 14px 18px, font-size: 18px, border-radius: 2rem),
          xxl: (padding: 16px 20px, font-size: 20px, border-radius: 2.5rem)
  );
  @mixin button-size($size) {
    @if not map.has-key($button-sizes, $size) {
      @error "Unknown button size: #{$size}. Available sizes: #{map.keys($button-sizes)}";
    }
    $size-map: map.get($button-sizes, $size);
    padding: map.get($size-map, padding);
    font-size: map.get($size-map, font-size);
    border-radius: map.get($size-map, border-radius);
  }

  $button-variants: (
          primary: (background: var(--color-primary), color: var(--color-text-light), border-color: transparent),
          secondary: (background: var(--color-secondary), color: var(--color-text-light), border-color: transparent),
          default: (background: var(--bg, var(--color-background-secondary)), color: var(--text, var(--color-text-primary)), border-color: var(--color-border-primary)),
          success: (background: var(--color-success), color: var(--color-text-light), border-color: transparent),
          warning: (background: var(--color-warning), color: var(--color-text-dark), border-color: transparent),
          danger: (background: var(--color-danger), color: var(--color-text-light), border-color: transparent),
          info: (background: var(--color-info), color: var(--color-text-light), border-color: transparent),
  );
  @mixin variant-style($variant) {
    @if not map.has-key($button-variants, $variant) {
      @error "Unknown button variant: #{$variant}. Available sizes: #{map.keys($button-variants)}";
    }
    $variant-map: map.get($button-variants, $variant);
    --bg: #{map.get($variant-map, background)};
    --text: #{map.get($variant-map, color)};
    --border-color: #{map.get($variant-map, border-color)};
    &.transparent {
      --bg: transparent;
      --text: #{map.get($variant-map, background)};
      --border-color: transparent;
    }
  }

  button, a[type="button"] {
    font-family: inherit;
    font-weight: 500;
    transition: .15s;

    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    // Apply variants
    @each $variant in map.keys($button-variants) {
      &.#{"" + $variant} {
        @include variant-style($variant);
      }
    }

    & {
      border: var(--border, solid 1px var(--border-color, var(--color-border-primary)));
      background: var(--bg, var(--color-background-secondary));
      color: var(--text, var(--color-text-primary));
    }

    &:not(.no-action):hover {
      opacity: .8;
      cursor: pointer;
    }
    &.no-action{ cursor: default; }

    &:disabled, &[disabled] {
      cursor: not-allowed;
      opacity: .2;

      &.loading {
        color: var(--color-text-muted);
        opacity: 1;
      }
      &:hover{
        opacity: .2;
        cursor: not-allowed;
      }
    }

    &.round {
      border-radius: 50% !important;
      aspect-ratio: 1 / 1;
    }
    &.badge{
      position: absolute;
      transform: translate(50%, -50%);
      font-size: x-small !important;
      padding: .25rem !important;
      width: 20px;
      height: 20px;
    }

    &.transparent {
      background: var(--bg, transparent);
      color: var(--text, inherit);
      border-color: transparent;
    }

    &.no-padding {
      padding: 0 !important;
    }

    &.block {
      display: block;
      width: 100%;
    }

    // Apply sizes
    @each $size in map.keys($button-sizes) {
      &.#{"" + $size} {
        @include button-size($size);
      }
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  button.loading, a.loading {
    position: relative;
    pointer-events: none;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: inherit;
      border: 2px solid transparent;
      border-top-color: var(--text, var(--color-primary, #3498db));
      animation: spin 1s linear infinite;
    }
  }
</style>
