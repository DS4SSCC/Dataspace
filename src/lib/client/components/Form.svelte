<script lang="ts">
    import {enhance} from '$app/forms';
    import type {Snippet} from 'svelte';
    import type {SubmitFunction, ActionResult} from '@sveltejs/kit';
    import type {HTMLFormAttributes} from 'svelte/elements';
    import type {MaybePromise} from '$lib/server/types/MaybePromise';

    let {
        action,
        method = 'POST',
        children,
        'before:submit': beforeSubmit,
        onresult,
        ...restProps
    }: {
        action?: string | URL;
        method?: string;
        children?: Snippet;
        'before:submit'?: (input: {
            action: URL;
            formData: FormData;
            formElement: HTMLFormElement;
            controller: AbortController;
            submitter: HTMLElement | null;
            cancel: () => void;
        }) => void;
        onresult?: (opts: {
            formData: FormData;
            formElement: HTMLFormElement;
            action: URL;
            result: ActionResult<any, any>;
            update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
        }) => MaybePromise<void>;
    } & HTMLFormAttributes = $props();

    const submitHandler: SubmitFunction<any, any> = (input) => {
        // Handle before:submit
        if (beforeSubmit) {
            let wasCanceled = false;
            const cancelWrapper = () => {
                input.cancel();
                wasCanceled = true;
            };

            beforeSubmit({
                ...input,
                cancel: cancelWrapper
            });

            if (wasCanceled) {
                return;
            }
        }

        // Return the result handler function
        return async (result) => {
            await onresult?.({
                formData: result.formData,
                formElement: result.formElement,
                action: result.action,
                result: result.result,
                update: result.update
            });
        };
    };
</script>

<form {action} {method} use:enhance={submitHandler} {...restProps}>
    {@render children?.()}
</form>
