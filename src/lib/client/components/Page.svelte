<script lang="ts">
    import Section from '$lib/client/components/Section.svelte';
    import Icon from '$lib/client/components/icons/Icon.svelte';
    import type { Snippet } from 'svelte';

    const {
        title,
        fit = false,
        previous_href,
        previous_label,
        subtitle,
        description,
        animate = true,
        breakpoints = false,
        prefix,
        suffix,
        children,
        id,
        ...restProps
    }: {
        title?: string | null | Snippet,
        subtitle?: string | Snippet,
        description?: string | Snippet,
        prefix?: Snippet,
        suffix?: Snippet,
        fit?: boolean,
        previous_href?: string,
        previous_label?: string,
        animate?: boolean,
        breakpoints?: boolean,
        children?: Snippet,
        style?: string,
        id?: string
    } = $props();

</script>

<div class="page" class:fit class:animate class:breakpoints {...restProps} {id}>
    {#if prefix}{@render prefix()}{/if}
    {#if title || previous_href}
        <Section style="display: flex; justify-content: space-between;">
            <div class="page-info">
                {#if typeof subtitle === 'function'}
                    {@render subtitle()}
                {/if}
                {#if previous_label && previous_href}
                    <h6 class="subtitle">
                        <a href={previous_href}>
                            <Icon icon="chevron-left" margin="right" />
                            {previous_label}
                        </a>
                    </h6>
                {/if}
                {#if title}
                    <h1 class="title">
                        {#if typeof title === 'function'}
                            {@render title?.()}
                        {:else if title}
                            <span>{title}</span>
                        {/if}
                    </h1>
                {/if}
                {#if description}
                    {#if typeof description === 'function'}
                        {@render description()}
                    {:else}
                        <span class="description">{description}</span>
                    {/if}
                {/if}
            </div>
            {#if suffix}
                <div class="suffix">
                    {@render suffix()}
                </div>
            {/if}
        </Section>
    {/if}

    {#if children}
        {@render children()}
    {/if}
</div>

<style lang="scss">
  @use '$lib/client/styles/mixins/responsive' as resp;
  @use '$lib/client/styles/mixins/animations' as anim;
  @use '$lib/client/styles/base/variables' as variables;
  @use 'sass:map';

  .page {
    padding-bottom: 1rem;
    padding-top: calc(70px + 1.5rem);
    padding-left: calc(2rem + var(--offset-left));
    color: var(--color, inherit);
    transition: .5s;

    &.animate {
      @include anim.fade-in-up();
    }

    &.breakpoints {
      justify-self: center;
      width: 100%;
      @each $breakpoint, $max-width in variables.$section-max-widths {
        @include resp.min-width(#{$breakpoint}) {
          max-width: $max-width;
        }
      }
    }


    &.fit {
      height: 100%;
      //overflow: hidden;
    }

    .page-info {
      width: 100%;

      .subtitle {
        --text: var(--color-text-secondary) !important;
        margin-bottom: map.get(variables.$spacings, "md");
      }

      .title {
        display: flex;
        align-items: center;
        column-gap: 0.5rem;
        text-wrap: balance;
      }

      .description {
        color: var(--color-text-secondary);
      }

    }

    .suffix {
      @include resp.min-width(lg) {
        margin-left: map.get(variables.$spacings, "md");
      }
    }
  }
</style>
