<script lang="ts">
    import {theme} from '../../stores/theme.store';
    import type {Theme} from '../../stores/theme.store';
    import Button from '$lib/client/components/Button.svelte';
    import Icon from '$lib/client/components/icons/Icon.svelte';

    const {
        includeText = false,
        ...restProps
    }: { includeText?: boolean,transparent?: boolean } = $props();

    // Subscribe to the theme store
    let selectedTheme: Theme = $derived($theme);

    const options: Theme[] = ['light', 'dark', 'auto'];

    function cycleTheme() {
        const currentIndex = options.indexOf(selectedTheme);
        const nextIndex = (currentIndex + 1) % options.length;
        theme.set(options[nextIndex]);
    }
</script>

<Button {...restProps} onclick={cycleTheme}>
    {#if (selectedTheme === 'light')}
        <Icon icon="brightness-high-fill"/>
    {/if}
    {#if (selectedTheme === 'dark')}
        <Icon icon="moon-stars-fill"/>
    {/if}
    {#if (selectedTheme === 'auto')}
        <Icon icon="circle-half"/>
    {/if}
    {#if includeText}<span>{selectedTheme}</span>{/if}
</Button>

<style lang="scss">
  span {
    margin-left: .5rem;
    text-transform: capitalize;
  }
</style>
