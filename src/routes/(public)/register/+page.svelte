<script lang="ts">
    import Form from "$lib/client/components/form/Form.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import BrandIcon from "$lib/client/components/icons/BrandIcon.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    let password = $state<string>('');
    let passwordValidate = $state<string>('');

    // Derived: true only when both are non-empty and match
    const passwordsMatch = $derived.by(() => {
        const p1 = password.trim();
        const p2 = passwordValidate.trim();
        return p1 !== '' && p2 !== '' && p1 === p2;
    });

    // Show error if both have content but don't match
    const showPasswordMismatch = $derived.by(() => {
        const p1 = password.trim();
        const p2 = passwordValidate.trim();
        return p1 !== '' && p2 !== '' && p1 !== p2;
    });
</script>

<div class="form-container">
    <Flexbox align="center" justify="center" gap=".5rem" style="margin-bottom: 1rem">
        <BrandIcon --width="40px" --color="black"/>
        <h3 style="margin-bottom: 0; color: black">DS4SSCC</h3>
    </Flexbox>
    <Card style="text-align: center">
        <div style="margin-bottom: 2rem">
            <h4>Welcome back!</h4>
            <p>We missed you! Please enter your details.</p>
        </div>
        <Form
                action="?/register"
                style="display: flex; flex-direction: column; row-gap: 1rem; width: 80%; margin: 0 auto; margin-bottom: 1rem"
        >
            <Input
                    label="Email"
                    type="email"
                    name="user.email"
                    placeholder="Enter your email"
                    --bg="var(--color-background-tertiary)"
            />
            <Input
                    label="Full name"
                    type="text"
                    name="user.full_name"
                    placeholder="Enter your Full name"
                    --bg="var(--color-background-tertiary)"
            />
            <Input
                    label="Password"
                    type="password"
                    name="user.password"
                    placeholder="Enter password"
                    bind:value={password}
                    --bg="var(--color-background-tertiary)"
            />
            <Input
                    label="Validate password"
                    type="password"
                    placeholder="Re-enter password"
                    bind:value={passwordValidate}
                    --bg="var(--color-background-tertiary)"
            />

            {#if showPasswordMismatch}
                <span style="color: red; font-size: 0.875rem; margin-top: -0.5rem;">
                    Passwords do not match
                </span>
            {/if}

            <Button variant="primary" type="submit">Register</Button>
        </Form>
        <span>
            Don't have an account? <a href="/register" style="color: #667eea; text-decoration: none;">Sign up here.</a>
        </span>
    </Card>
</div>

<Button class="back-button" href="/datasets" style="margin: 1.5rem">
    <Icon icon="arrow-left" margin="right"/>
    Back to Homepage
</Button>

<style>
    .form-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc(100% - 2rem);
        max-width: 500px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 1;
    }
</style>
