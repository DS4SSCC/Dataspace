<script lang="ts">
    import Page from "$lib/client/components/Page.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import {session} from "$lib/client/stores/session.store.svelte.js";
    import Gravatar from "$lib/client/components/icons/Gravatar.svelte";

    // User account data
    let user = {
        name: 'Steven Slaa',
        email: 'steven@example.com',
        company: 'DataSpace Inc.',
        role: 'Administrator',
        joinDate: '2025-28-09',
        lastLogin: '2023-02-09 14:32:45',
        avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHJkA305E0NPw/profile-displayphoto-scale_200_200/B4EZhyT7TyHgAY-/0/1754264484406?e=2147483647&v=beta&t=Wo0WJad3R27IBM_wNGD2VtmvPcQRQ8UdL-Na8dudJCk'
    };

    // Account settings
    let settings = {
        notifications: {
            email: true,
            sms: false,
            push: true
        },
        privacy: {
            profilePublic: false,
            showActivity: true
        },
        security: {
            twoFactor: true,
            autoLogout: 30
        }
    };

    // Form state
    let formData = {...user};
    let isEditing = false;
    let isSaving = false;

    // Save account changes
    async function saveAccount() {
        isSaving = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        user = {...formData};
        isSaving = false;
        isEditing = false;
    }

    // Cancel editing
    function cancelEdit() {
        formData = {...user};
        isEditing = false;
    }


    // let gravatarAvatar = $state<string>(`https://gravatar.com/avatar?d=mp`)
    // $effect.pre(() => {
    //     const encoded = new TextEncoder().encode(session.user.email)
    //     crypto.subtle.digest('SHA-256', encoded)
    //         .then((digest) => {
    //             const hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
    //             return hashArray
    //                 .map((b) => b.toString(16).padStart(2, "0"))
    //                 .join("");
    //         })
    //         .then((hash) => gravatarAvatar = `https://gravatar.com/avatar/${hash}?d=mp`)
    // })
    //
    // $inspect(session.user)

</script>

<Page title="Account Settings" description="Manage your account information and preferences">
    {#snippet suffix()}
        {#if isEditing}
            <Button variant="secondary" on:click={cancelEdit} disabled={isSaving}>
                Cancel
            </Button>
            <Button variant="primary" on:click={saveAccount} disabled={isSaving}>
                {#if isSaving}
                    <Icon icon="spinner" spin margin="right"/>
                    Saving...
                {:else}
                    <Icon icon="save" margin="right"/>
                    Save Changes
                {/if}
            </Button>
        {:else}
            <Button variant="primary" on:click={() => isEditing = true}>
                <Icon icon="pencil" margin="right"/>
                Edit Profile
            </Button>
        {/if}
    {/snippet}

    <Section>
        <Row>
            <Col>
                <Card fit>
                    <Flexbox align="center" gap="1.5rem">
                        <Gravatar email={session.user.email} alt="Profile" class="avatar"/>
<!--                        <img src={gravatarAvatar} alt="Profile" class="avatar"/>-->
                        <div>
                            <h2 style="margin-bottom: 0">{session.user.full_name}</h2>
                            <p class="text-secondary">{session.user.email}</p>
                            <p class="text-small">Member since {session.user.created_at.toLocaleDateString()}</p>
                        </div>
                    </Flexbox>
                </Card>
            </Col>
        </Row>
    </Section>

    <Section>
        <Row>
            <Col>
                <Card fit>
                    <h3>Profile Information</h3>
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <Input
                                id="name"
                                type="text"
                                value={session.user.full_name}
                                disabled={!isEditing}
                        />
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <Input
                                id="email"
                                type="email"
                                value={session.user.email}
                                disabled={!isEditing}
                        />
                    </div>

                    <div class="form-group">
                        <label for="company">Company</label>
                        <Input
                                id="company"
                                bind:value={formData.company}
                                disabled={!isEditing}
                        />
                    </div>

                    <div class="form-group">
                        <label for="role">Role</label>
                        <Input
                                id="role"
                                bind:value={formData.role}
                                disabled={!isEditing}
                        />
                    </div>
                </Card>
            </Col>

            <Col width="6">
                <Card>
                    <h3>Account Settings</h3>

                    <div class="form-group">
                        <label>Notifications</label>
                        <Flexbox direction="column" gap="0.5rem">
                            <label class="checkbox-label">
                                <input
                                        type="checkbox"
                                        bind:checked={settings.notifications.email}
                                        disabled={!isEditing}
                                />
                                Email notifications
                            </label>
                            <label class="checkbox-label">
                                <input
                                        type="checkbox"
                                        bind:checked={settings.notifications.sms}
                                        disabled={!isEditing}
                                />
                                SMS notifications
                            </label>
                            <label class="checkbox-label">
                                <input
                                        type="checkbox"
                                        bind:checked={settings.notifications.push}
                                        disabled={!isEditing}
                                />
                                Push notifications
                            </label>
                        </Flexbox>
                    </div>

                    <div class="form-group">
                        <label>Privacy</label>
                        <Flexbox direction="column" gap="0.5rem">
                            <label class="checkbox-label">
                                <input
                                        type="checkbox"
                                        bind:checked={settings.privacy.profilePublic}
                                        disabled={!isEditing}
                                />
                                Make profile public
                            </label>
                            <label class="checkbox-label">
                                <input
                                        type="checkbox"
                                        bind:checked={settings.privacy.showActivity}
                                        disabled={!isEditing}
                                />
                                Show activity status
                            </label>
                        </Flexbox>
                    </div>

                    <div class="form-group">
                        <label>Security</label>
                        <Flexbox direction="column" gap="0.5rem">
                            <label class="checkbox-label">
                                <input
                                        type="checkbox"
                                        bind:checked={settings.security.twoFactor}
                                        disabled={!isEditing}
                                />
                                Two-factor authentication
                            </label>

                            <div class="form-row">
                                <label>Auto Logout (minutes)</label>
                                <Input
                                        type="number"
                                        min="5"
                                        max="120"
                                        bind:value={settings.security.autoLogout}
                                        disabled={!isEditing}
                                />
                            </div>
                        </Flexbox>
                    </div>
                </Card>
            </Col>
        </Row>
    </Section>

    <Section>
        <Row>
            <Col>
                <Card>
                    <h3>Account Activity</h3>
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon">
                                <Icon icon="lock"/>
                            </div>
                            <div class="activity-content">
                                <p>Two-factor authentication enabled</p>
                                <p class="text-secondary">October 15, 2023 at 09:22 AM</p>
                            </div>
                        </div>

                        <div class="activity-item">
                            <div class="activity-icon">
                                <Icon icon="envelope"/>
                            </div>
                            <div class="activity-content">
                                <p>Email updated to {user.email}</p>
                                <p class="text-secondary">October 10, 2023 at 02:45 PM</p>
                            </div>
                        </div>

                        <div class="activity-item">
                            <div class="activity-icon">
                                <Icon icon="sign-in"/>
                            </div>
                            <div class="activity-content">
                                <p>Logged in from new device</p>
                                <p class="text-secondary">October 5, 2023 at 11:30 AM</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    </Section>
</Page>

<style>
    :global(.avatar) {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--color-border-primary);
    }

    .text-secondary {
        color: var(--color-text-secondary);
        margin: 0.25rem 0;
    }

    .text-small {
        font-size: 0.85rem;
        color: var(--color-text-tertiary);
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .form-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .form-row label {
        margin-bottom: 0;
    }

    .activity-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .activity-item {
        display: flex;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--color-border-primary);
    }

    .activity-item:last-child {
        border-bottom: none;
    }

    .activity-icon {
        background: var(--color-background-tertiary);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-primary);
    }

    .activity-content {
        flex: 1;
    }

    .activity-content p {
        margin: 0.25rem 0;
    }

    .activity-content p:first-child {
        font-weight: 500;
    }
</style>
