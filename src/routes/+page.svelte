<script lang="ts">
    // No additional script needed for basic functionality
import Navbar from "$lib/client/components/navbar/Navbar.svelte";
    import NavbarItem from "$lib/client/components/navbar/NavbarItem.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
</script>

<Navbar style="filter: invert(1);">
    <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; align-items: stretch;">
        <div style="display: flex; column-gap: 1rem; align-items: stretch; padding: 0 1.5rem">
            <NavbarItem href="/" exact>Home</NavbarItem>
            <NavbarItem href="/datasets">Datasets</NavbarItem>
        </div>
    </div>
</Navbar>
<section class="landing-hero">
    <div style="padding: 2rem">
        <h1 style="font-size: calc(2rem + 2vw); color: white">Building the<br/>Future of Urban Data</h1>
        <p style="font-size: calc(.5rem + .5vw); color: white; margin-bottom: 3rem">Data Space for Smart and Sustainable Cities & Communities<br/>Empowering European urban innovation through
            trusted data sharing.</p>
        <Button variant="primary" size="lg" href="/datasets">Explore Datasets <Icon icon="arrow-right" margin="left"/></Button>
    </div>
</section>
<video
        class="background-video"
        autoplay
        muted
        loop
        playsinline
>
    <source src="/backgrounds/background-video.mp4" type="video/mp4"/>
</video>

<style>
    .background-video {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100dvh;
        object-fit: cover;
        z-index: 0;
    }
    .landing-hero {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100dvh;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        background: rgba(0,0,0,.3);

    }
</style>
