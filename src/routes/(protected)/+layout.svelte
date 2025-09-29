<script lang="ts">
    import '$lib/client/styles/app.scss';
    import Navbar from "$lib/client/components/navbar/Navbar.svelte";
    import NavbarItem from "$lib/client/components/navbar/NavbarItem.svelte";

    let { children } = $props();
</script>

<Navbar --bg="var(--color-background-primary)" --color="var(--color-text-primary)" --color-inactive="silver" --color-active="var(--color-primary)">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; align-items: stretch;">
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            <NavbarItem href="/" exact>Home</NavbarItem>
            <NavbarItem href="/datasets" exact>Datasets</NavbarItem>
            <NavbarItem href="/catalogs" exact>Catalogs</NavbarItem>
        </div>
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            <NavbarItem href="/login">
                Logged in as Steven Slaa
            </NavbarItem>
        </div>
    </div>
</Navbar>
{@render children?.()}

