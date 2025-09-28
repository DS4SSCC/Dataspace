<script lang="ts">
    import '$lib/client/styles/app.scss';
    import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    <title>DS4SSCC</title>
</svelte:head>

{@render children?.()}

