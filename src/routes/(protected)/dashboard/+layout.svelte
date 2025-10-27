<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import Navbar from "$lib/client/components/navbar/Navbar.svelte";
    import NavbarItem from "$lib/client/components/navbar/NavbarItem.svelte";
    import {session} from "$lib/client/stores/session.store.svelte";

    let {children} = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>

<Navbar --bg="var(--color-background-primary)" --color="var(--color-text-primary)" --color-inactive="silver" --color-active="var(--color-primary)">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; align-items: stretch;">
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            <NavbarItem href="/dashboard/analytics">Analytics</NavbarItem>
            <NavbarItem href="/dashboard/catalogs">Catalogs</NavbarItem>
            <NavbarItem href="/dashboard/account">Account</NavbarItem>
            <NavbarItem href="/dashboard/datasets">Datasets</NavbarItem>
            <NavbarItem href="/dashboard/requests">Requests</NavbarItem>
            <NavbarItem href="/dashboard/api">API</NavbarItem>
        </div>
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            <NavbarItem href="/dashboard/account" --color-inactive="var(--color-text-primary)">
                Logged in as {session.user.full_name}
            </NavbarItem>
        </div>
    </div>
</Navbar>
{@render children?.()}
