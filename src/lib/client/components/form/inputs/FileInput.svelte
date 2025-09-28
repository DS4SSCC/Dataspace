<script lang="ts" module>
	import type {
		FocusEventHandler,
		HTMLInputAttributes,
		KeyboardEventHandler
	} from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type Props = {
		name?: string;
		value?: string;
		element?: HTMLInputElement;
		placeholder?: string | null | undefined;
		style?: string;
		readonly?: boolean;
		required?: boolean;
		multiple?: boolean | string;
		accepts?: string | string[] | undefined

		showUploadList?: boolean;

		// Events
		onchange?: ((input: File[]) => unknown) | undefined | null,
		onfocus?: FocusEventHandler<HTMLInputElement> | null | undefined,
		onkeyup?: KeyboardEventHandler<HTMLInputElement> | null | undefined,
		onkeydown?: KeyboardEventHandler<HTMLInputElement> | null | undefined,

		//Snippets
		children?: Snippet;
	} & HTMLInputAttributes;
</script>

<script lang="ts">
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import Button from '$lib/client/components/Button.svelte';
    import {onMount} from "svelte";

	let {
		name,
		style,
		value = $bindable(),
		element = $bindable(),
		placeholder,
		multiple = false,
		required = false,
		disabled = false,
		showUploadList = true,
		onchange,
		onfocus,
		onkeyup,
		onkeydown,
		children,
		...restProps
	}: Props = $props();

    let inputElement = $state<HTMLInputElement | undefined>();
    $effect(()=>{ if(inputElement) element = inputElement})

	let files: File[] = $state([]);
	let dragOver = $state(false);

	function handleFiles(selectedFiles: FileList | null) {
		if (selectedFiles) {
			const newFiles = Array.from(selectedFiles) as File[];
			files = multiple ? [...files, ...newFiles] : newFiles;
			onchange?.(files);
		}
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function onDragLeave() {
		dragOver = false;
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		handleFiles(event.dataTransfer?.files || null);
	}

	function removeFile(index: number) {
		files = files.toSpliced(index, 1); // non-mutating splice
		onchange?.(files);
	}

    let form = $state<HTMLFormElement | null>();
    const handleReset = () => {
        files = []; // reset file list
    };
    onMount(() => {
        form = inputElement?.closest('form');
        if (form) {
            form.addEventListener('submit', handleReset);
            form.addEventListener('reset', handleReset);
        }

        return () => {
            if (form) {
                form.removeEventListener('submit', handleReset);
                form.removeEventListener('reset', handleReset);
            }
        };
    });
</script>

<div class="file-input-wrapper" {style}>
	<input
		type="file"
		id="file-{name}"
		bind:this={inputElement}
		{name}
		multiple={typeof multiple === 'string'? (multiple === 'true') : multiple}
		{required}
		{disabled}
		onchange={(e) => handleFiles(e.currentTarget.files)}
		onreset={handleReset}
		{onfocus}
		{onkeyup}
		{onkeydown}
		style="display: none;"
		{...restProps}
	/>

	<div
		class="drop-zone {dragOver ? 'drag-over' : ''}"
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		ondrop={onDrop}
		onclick={() => inputElement?.click()}
		role="presentation"
	>
		<Icon icon="file-arrow-up" style="font-size: large" />
		<p>{placeholder ?? (multiple ? 'Drag & drop files here or click to select' : 'Drag & drop a file here or click to select')}</p>
	</div>

	{#if files.length > 0 && showUploadList}
		<ul class="file-list">
			{#each files as file, index (file.name, file.size, file.lastModified)}
				<li>
					<span>{file.name}</span>
					<Button size="sm" onclick={() => removeFile(index)}>
						<Icon icon="x-lg" />
					</Button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
{@render children?.()}

<style lang="scss">
  @use "$lib/client/styles/base/variables" as vars;
  @use "sass:map";

  .file-input-wrapper {

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;

    :global(.drop-zone) {
      height: 100%;
    }
  }

  .hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  .drop-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 1.5rem;
    border: 2px dashed var(--color-border-primary);
    border-radius: map.get(vars.$border-radii, "md");
    cursor: pointer;
    text-align: center;
    background-color: var(--color-background-primary);
  }

  .drop-zone.drag-over {
    background-color: var(--color-background-secondary);
    border-color: var(--color-primary);
  }

  .file-list {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;
      column-gap: .5rem;
      margin-top: map.get(vars.$spacings, "sm");

      span {
        flex: 1;
        background: var(--color-background-primary);
        border: 1px solid var(--color-border-primary);
        padding: map.get(vars.$spacings, "sm");
        border-radius: map.get(vars.$border-radii, "md");
        font-size: small;
      }

      :global(button) {
        height: 38px;
      }
    }
  }
</style>
