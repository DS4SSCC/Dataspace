<script lang="ts" module>
    import type {
        ChangeEventHandler,
        FocusEventHandler,
        HTMLTextareaAttributes,
        KeyboardEventHandler
    } from 'svelte/elements';

    export type Props = {
        name?: string;
        value?: string;
        placeholder?: string | null;
        element?: HTMLTextAreaElement;
        style?: string;
        readonly?: boolean;
        required?: boolean;

        // Events
        onchange?: ChangeEventHandler<HTMLTextAreaElement> | undefined | null,
        onfocus?: FocusEventHandler<HTMLTextAreaElement> | null | undefined,
        onkeyup?: KeyboardEventHandler<HTMLTextAreaElement> | null | undefined,
        onkeydown?: KeyboardEventHandler<HTMLTextAreaElement> | null | undefined,
    } & HTMLTextareaAttributes;
</script>

<script lang="ts">
    let {
        name,
        required,
        readonly,
        placeholder,
        style,
        value = $bindable(),
        element = $bindable(),
        onchange,
        onfocus,
        onkeyup,
        onkeydown,
        ...restProps
    }: Props = $props();
</script>

<textarea
        class="form-control"
        {name}
        id={`input-${name}`}
        bind:value
        bind:this={element}

        {required} {readonly} {placeholder} {style}
        {onchange} {onfocus} {onkeyup} {onkeydown}
        {...restProps}>
</textarea>

<style lang="scss">
  @use "$lib/client/styles/mixins/input";

  textarea {
    @include input.base_input;
    min-width: 100%;
    max-width: 100%;
  }
</style>
