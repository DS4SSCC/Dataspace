<script lang="ts">
	import { browser } from '$app/environment';
	import Button from '$lib/client/components/Button.svelte';
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import { onDestroy, type Snippet } from 'svelte';
	import { page } from '$app/state';
    import {modals} from "$lib/client/stores/modal.store.svelte";

	let {
		id = Math.random().toString(36).substring(2, 9),
		title,
		description,
		dismissible = true,
		self_dismiss = dismissible,
		show = $bindable(false),
		padding = true,
		alignVertical = 'bottom',
        unstyled = false,
		portal = false,
		class: clzz,
		footer,
		header,
		onclose,
		...restProps
	}: {
		title?: string,
		description?: string | Snippet,
		dismissible?: boolean,
		self_dismiss?: boolean,
		show: boolean,
		style?: string,
		id?: string,
		padding?: boolean
		alignVertical?: 'top' | 'center' | 'bottom',
		portal?: boolean | string | HTMLElement,
		unstyled?: boolean,
		class?: string
		children?: Snippet
		footer?: Snippet,
		header?: Snippet,
		onclose?: ()=> void
	} = $props();

	$effect(() => {
		if (id) {
			const modal = page.url.searchParams.get('modal');
			if (modal) show = modal === id;
		}
	});

    let wasOpen = $state(false);
    $effect(() => {
        if (wasOpen && !show) {
            onclose?.();
        }
        wasOpen = show;
    });

	let computedClass = $derived.by(()=>{
		return `modal ${clzz ?? ''} ${alignVertical ? `align-${alignVertical}` : ''}`
	})

	let dialog: HTMLDialogElement | undefined = $state();
	let isClosing = $state(false);
	let portalTarget: HTMLElement | null = $state(null);
	let originalParent: HTMLElement | null = $state(null);

	// Determine portal target
	$effect(() => {
		if (!browser || !portal) {
			portalTarget = null;
			return;
		}

		let target: HTMLElement | null = null;

		if (portal === true) {
			target = document.body;
		} else if (typeof portal === 'string') {
			target = document.querySelector(portal);
			// Fallback to body if selector doesn't match anything
			if (!target) {
				target = document.body;
			}
		} else if (portal instanceof HTMLElement) {
			target = portal;
		}

		portalTarget = target;
	});

	// Handle portaling
	$effect(() => {
		if (dialog && portalTarget && browser) {
			// Store original parent for cleanup
			originalParent = dialog.parentElement;

			// Move dialog to portal target
			portalTarget.appendChild(dialog);
		}
	});

    $effect(() => {
        if (!browser) return;

        // Handle modal state changes
        if (show && id) {
            modals.open(id, portalTarget);
            // Handle dialog opening
            if (dialog && !dialog.open) {
                dialog.showModal();
            }
        } else if (!show && id) {
            modals.close(id);
            // Handle dialog closing
            if (dialog && dialog.open && !isClosing) {
                handleClose();
            }
        }

        // Cleanup function
        return () => {
            if (show && id) {
                modals.close(id);
            }
        };
    });

	function handleClose() {
		if (!dialog || isClosing) return;

		isClosing = true;
		// Wait for fade-out animation to complete before actually closing
		setTimeout(() => {
			if (dialog && dialog.open) {
				dialog.close();
				// Remove modal-show class from the portal target or body
				const targetElement = portalTarget || document.body;
				targetElement.classList.remove('modal-show');
			}
			isClosing = false;
		}, 300); // Match the animation duration
	}

	function handleDialogClose(event: Event) {
		// Prevent default close if not dismissible
		if (!dismissible) {
			event.preventDefault();
			return;
		}

		// If we're already in the closing process, don't interfere
		if (isClosing) return;

		show = false;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (dismissible && event.target === dialog) {
			show = false;
		}
	}

    // Update onDestroy:
    onDestroy(() => {
        if (browser) {
            // Ensure modal is closed on destroy
            if (show && id) {
                modals.close(id);
            }

            // Handle dialog cleanup
            if (dialog && originalParent && portalTarget) {
                try {
                    originalParent.appendChild(dialog);
                } catch (e) {
                    // Ignore errors if original parent is no longer in DOM
                }
            }
        }
    });
</script>

{#if show || (dialog?.open && isClosing)}
	<dialog
		bind:this={dialog}
		class:show={show && !isClosing}
		class:noPadding={!padding}
		onclose={handleDialogClose}
		onclick={handleBackdropClick}
		class={computedClass}
		{...restProps}
	>
		<div class="modal-dialog" class:unstyled style={restProps.style}>
			{#if title}
				<div class="modal-header">
					<span class="h3 modal-title">{title}</span>
					{#if description}
						<span class="modal-description">
								{#if typeof description === 'function'}
										{@render description()}
								{:else}
									 {description}
								{/if}
						</span>
					{/if}
					{#if self_dismiss}
						<Button transparent class="modal-close-btn" onclick={() => {show = false;}}>
							<Icon icon="x-lg" />
						</Button>
					{/if}
					{#if header}
						<div>
							{@render header()}
						</div>
					{/if}
				</div>
			{/if}
			{@render restProps.children?.()}
			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</dialog>
{/if}

<style lang="scss">
  @use '$lib/client/styles/mixins/responsive' as resp;
  @use '$lib/client/styles/mixins/hover-scrollbar' as sb;

  $animation-duration: 0.3s;
  $modal-padding: 1rem;
  $modal-border-radius: calc(var(--border-radius, 12px) + $modal-padding);

  dialog.modal {
    position: fixed;
    width: 100vw;
    height: 100dvh;
    left: 0;
    top: 0;
    justify-content: center;
    align-items: var(--align-vertical, flex-end);
    opacity: 0;
    display: none;
    z-index: 99;
    animation: fade-out $animation-duration forwards;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    max-width: none;
    max-height: none;
    pointer-events: all;
		overflow: hidden;

    @supports (-webkit-touch-callout: none) {
      /* CSS specific to iOS devices */
      padding-bottom: 20px;
    }

    @include resp.min-width(md) {
      align-items: center !important;
      padding: 1.5rem;
    }

    // Native backdrop styling
    &::backdrop {
      background: rgba(0, 0, 0, 0.5);
      animation: backdrop-fade-out $animation-duration forwards;
      pointer-events: all;
    }

    .modal-dialog {
      max-height: 90%;
      width: 100%;
      height: var(--height);
      color: var(--text, var(--color-text-primary));
      animation: slide-out $animation-duration forwards;
      z-index: 99;
      overflow: auto;
      pointer-events: auto;
      &:not(.unstyled){
        background: var(--bg, var(--color-background-secondary));
        border: solid 1px var(--color-border-primary);
        padding: 0 $modal-padding $modal-padding $modal-padding;
        border-radius: $modal-border-radius $modal-border-radius 0 0;
        @include resp.min-width(md){border-radius: $modal-border-radius !important;}
      }
      @include resp.min-width(md) {
        min-width: var(--width, 500px);
        width: var(--width);
        max-width: var(--max-width, calc(100% - 24px));
        animation-name: slide-out;
        //region style scrollbar on desktop
        @include sb.scrollbar();
        //endregion
      }

      .modal-header {
        position: sticky;
        top: 0;
        left: 0;
        z-index: 99;
        background: inherit;
        border-bottom: solid 1px var(--color-border-primary);
        padding-top: $modal-padding;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;

        .modal-title {
          display: block;
          padding-right: 50px;
          margin-top: 0;
        }

        .modal-description {
          color: var(--color-text-secondary);
          padding-right: 50px;
        }
      }
      .modal-footer {
        position: sticky;
        bottom: 0;
        left: 0;
        background: inherit;
        border-top: solid 1px var(--color-border-primary);
        padding-top: $modal-padding;
        padding-bottom: $modal-padding;
        margin-top: $modal-padding;
      }
      &:has(:last-child.modal-footer) {
        padding-bottom: 0;
      }

      :global(.modal-close-btn) {
        position: absolute;
        padding: 0.25rem !important;
        z-index: 99;
        right: 0 !important;
        @include resp.min-width(md) {
          top: $modal-padding !important;
        }
      }
    }

    &.show {
      animation: fade-in $animation-duration forwards;
      display: flex;
      opacity: 1;

      &::backdrop {
        animation: backdrop-fade-in $animation-duration forwards;
      }

      .modal-dialog {
        animation: slide-in $animation-duration forwards;
      }
    }

    &.noPadding .modal-dialog {
      padding: 0;
    }

    @include resp.max-width(md) {
      &.align-top {
        --align-vertical: flex-start;

        .modal-dialog {
          border-radius: 0 0 $modal-border-radius $modal-border-radius;

          :global(.modal-close-btn) {
            bottom: $modal-padding;
          }
        }
      }
      &.align-center {
        --align-vertical: center;

        .modal-dialog {
          border-radius: $modal-border-radius;

          :global(.modal-close-btn) {
            top: $modal-padding;
          }
        }
      }
      &.align-bottom {
        --align-vertical: flex-end;

        .modal-dialog {
          border-radius: $modal-border-radius $modal-border-radius 0 0;

          :global(.modal-close-btn) {
            top: $modal-padding;
          }
        }
      }
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
      display: flex;
    }
    100% {
      opacity: 0;
      display: none;
    }
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
      display: none;
    }
    100% {
      opacity: 1;
      display: flex;
    }
  }

  @keyframes backdrop-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes backdrop-fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes slide-in {
    0% {
      transform: translateY(40%);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes slide-out {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(40%);
    }
  }

  :global(body.modal-show) {
    overflow-y: hidden;
  }
</style>
