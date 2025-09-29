<script lang="ts">
    import type {EChartsType} from "echarts";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    let {title, description, chart = $bindable(), ondownload, onexpand}: {
        title: string,
        description?: string,
        chart: EChartsType
        ondownload?: (e:any, chart: EChartsType) => void
        onexpand?: (e:any, chart: EChartsType) => void
    } = $props();

    let container: HTMLDivElement | null = null;
    let resizeObserver: ResizeObserver | null = null;

    $effect(() => {
        if (chart && container) {
            // Initial resize
            setTimeout(() => chart.resize(), 0);

            // Set up ResizeObserver for responsive behavior
            resizeObserver = new ResizeObserver(() => {
                chart.resize();
            });

            resizeObserver.observe(container);
        }

        // Cleanup
        return () => {
            if (resizeObserver && container) {
                resizeObserver.disconnect();
            }
        };
    });

    // Handle window resize as fallback
    $effect(() => {
        const handleResize = () => {
            if (chart) {
                chart.resize();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
</script>

<Card>
    <Flexbox justify="space-between">
        <h3 style="margin-bottom: 0">{title}</h3>
        {#if ondownload || onexpand}
            <Flexbox columnGap=".5rem">
                {#if ondownload}<Button onclick={(e)=> ondownload?.(e, chart)}><Icon icon="download"/></Button>{/if}
                {#if onexpand}<Button onclick={(e)=> onexpand?.(e, chart)}><Icon icon="arrows-angle-expand"/></Button>{/if}
            </Flexbox>
        {/if}
    </Flexbox>
    {#if description}<p style="color: var(--color-text-secondary)">{description}</p>{/if}
    <div bind:this={container} class="chart-container">
        <div bind:this={chart} class="chart"></div>
    </div>
</Card>

<style lang="scss">
  .chart-container {
    width: 100%;
    height: 350px;
    position: relative;

    @media (max-width: 768px) {
      height: 300px;
    }

    @media (max-width: 480px) {
      height: 250px;
    }
  }

  .chart {
    width: 100%;
    height: 100%;
  }
</style>
