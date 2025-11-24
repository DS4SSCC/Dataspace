<script lang="ts">
    import '$lib/client/styles/app.scss';
    import Navbar from "$lib/client/components/navbar/Navbar.svelte";
    import NavbarItem from "$lib/client/components/navbar/NavbarItem.svelte";
    import {setContext} from "svelte";

    let { data, children } = $props();
    setContext("sectors", data.sectors);
</script>

<Navbar --bg="var(--color-background-primary)" --color="var(--color-text-primary)" --color-inactive="silver" --color-active="var(--color-primary)">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; align-items: stretch;">
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            <NavbarItem href="/" exact>Home</NavbarItem>
            <NavbarItem href="/datasets" exact>Datasets</NavbarItem>
        </div>
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            {#if data.session}
                <NavbarItem href="/dashboard" --color-inactive="var(--color-text-primary)">
                    {data.session.user.full_name}
                </NavbarItem>
            {:else}
                <NavbarItem href="/login" --color-inactive="var(--color-text-primary)">
                    Login
                </NavbarItem>
            {/if}
        </div>
    </div>
</Navbar>
{@render children?.()}

