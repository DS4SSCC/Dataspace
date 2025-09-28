<script lang="ts">
    // Reactive state
    import Form from "$lib/client/components/form/Form.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import BrandIcon from "$lib/client/components/icons/BrandIcon.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";

    let email = $state('');
    let password = $state('');

    // Derived state: is form valid?
    const isValid = $derived(
        email.trim() !== '' && password.trim() !== '' && email.includes('@')
    );

</script>

<div class="form-container">
    <Flexbox align="center" justify="center" gap=".5rem" style="margin-bottom: 1rem">
        <BrandIcon --width="40px" --color="bloack"/>
        <h3 style="margin-bottom: 0; color: black">DS4SSCC</h3>
    </Flexbox>
    <Card style="text-align: center">
        <div style="margin-bottom: 2rem">
            <h4>Welcome back!</h4>
            <p>We missed you! Please enter your details.</p>
        </div>
        <Form action="?/login"
              style="display: flex; flex-direction: column; row-gap: 1rem; width: 80%; margin: 0 auto; margin-bottom: 1rem">
            <Input label="Email" type="email" name="user.email" placeholder="Enter your Email"
                   --bg="var(--color-background-tertiary)"/>
            <Input label="Password" type="password" name="user.password" placeholder="Enter Password"
                   --bg="var(--color-background-tertiary)"/>
            <Button variant="primary" type="submit">Login</Button>
        </Form>
        <span>
            Don’t have an account? <a href="/register" style="color: #667eea; text-decoration: none;">Register here.</a>
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
