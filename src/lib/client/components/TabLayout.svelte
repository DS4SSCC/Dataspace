<script lang="ts" module>
    import type {Snippet} from "svelte";

    export type TabController = {
        next(): void;
        previous(): void;
        get current(): number;
        goto(index: number): number;
    }

    export type Tab = {
        title: string,
        content?: Snippet<[TabController]>
    }

</script>

<script lang="ts">
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Card from "$lib/client/components/Card.svelte";

    const {tabs, startIndex = 0, selectorContainerStyle, tabSelector}: {
        tabs: Tab[],
        selectorContainerStyle?: string,
        tabSelector?: Snippet<[{readonly tab: Tab, readonly i: number, readonly selected: boolean, readonly onclick: () => void}]>,
        startIndex?: number } = $props();
    let selected = $state<number>(startIndex);

    const controller: TabController = {
        next() {
            selected++;
        },
        previous() {
            selected--;
        },
        get current() {
            return selected;
        },
        goto(index: number) {
            if (index > tabs.length - 1) index = tabs.length - 1;
            if (index < 0) index = 0;
            return selected = index;
        }
    }

</script>

<Card style="display: inline-flex; gap: .5rem; padding: .5rem;{selectorContainerStyle ? ` ${selectorContainerStyle}` : ''}">
    {#each tabs as tab, i}
        {#if tabSelector}
            {@render tabSelector({tab, i, selected: selected === i, onclick: (() => selected = i)})}
        {/if}
        <Button class="tab-button{selected === i ? ' selected' : ''}"
                variant={selected === i ? 'primary' : 'transparent'}
                onclick={() => selected = i}>
            {tab.title}
        </Button>
    {/each}
</Card>


{@render tabs[selected]?.content?.(controller)}

<style lang="scss">

  :global(.tab-button) {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: #f0f0f0;
    cursor: pointer;
  }

  .tab-button.selected {
    background: var(--color-primary);
    border-bottom: none;
  }


</style>

