<script lang="ts">
    // Reactive state
    import Form from "$lib/client/components/Form.svelte";

    let email = $state('');
    let password = $state('');
    let rememberMe = $state(false);
    let submitting = $state(false);
    let message = $state('');

    // Derived state: is form valid?
    const isValid = $derived(
        email.trim() !== '' && password.trim() !== '' && email.includes('@')
    );

</script>


<div class="login-container">
    <div class="login-box">
        <h2>DS4SSCC Dataspace</h2>
        <h3>Login to your account</h3>

        {#if message}
            <div class="message success">{message}</div>
        {/if}

        <Form action="">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        bind:value={email}
                        required
                />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        bind:value={password}
                        required
                />
            </div>

            <div class="checkbox-group">
                <input
                        id="remember"
                        type="checkbox"
                        bind:checked={rememberMe}
                />
                <label for="remember">Remember me</label>
            </div>

            <button
                    class="submit-btn"
                    disabled={!isValid || submitting}
                    aria-busy={submitting}
            >
                {submitting ? 'Logging in...' : 'Login'}
            </button>
        </Form>

        <p style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">
            Don’t have an account? <a href="#" style="color: #667eea; text-decoration: none;">Contact administrator</a>
        </p>
    </div>
</div>


<!-- Inline styles for simplicity -->
<style>
    /* No <style> tag needed if you want 100% inline — but Svelte requires it.
       We’ll keep minimal scoped styles here. */
    .login-container {
        font-family: system-ui, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
    }

    .login-box {
        background: white;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 420px;
    }

    .login-box h2 {
        text-align: center;
        margin-bottom: 24px;
        color: #333;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
    }

    .form-group input {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s;
    }

    .form-group input:focus {
        outline: none;
        border-color: #667eea;
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
    }

    .checkbox-group input {
        width: auto;
    }

    .submit-btn {
        width: 100%;
        padding: 14px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .submit-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    .submit-btn:not(:disabled):hover {
        background: #5a6fd8;
    }

    .message {
        margin-top: 20px;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        font-weight: 500;
    }

    .message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
</style>
