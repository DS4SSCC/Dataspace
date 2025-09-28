<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';

	// Define types
	type Position = 'top' | 'bottom' | 'left' | 'right';

	const {
		position = 'top',
		delay = 0,
		text,
		disablePointerEvents = false,
		children
	} = $props<{
		position?: Position;
		delay?: number;
		text?: string | Snippet;
		disablePointerEvents?: boolean;
		children: Snippet;
	}>();

	// Global visibility state
	let isVisible = $state(false);
	let timeoutId: number | undefined;

	// DOM refs
	let popoverRef: HTMLElement;
	let targetRef: HTMLElement;
	let uniqueId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

	// Internal position (for arrow/class)
	let actualPosition = $state(position);

	// Position the popover relative to the target
	function positionPopover() {
		if (!targetRef || !popoverRef) return;

		const targetRect = targetRef.getBoundingClientRect();
		const popoverRect = popoverRef.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const gap = 8;

		let top = 0;
		let left = 0;
		let newPosition = position;

		switch (position) {
			case 'top':
				top = targetRect.top - popoverRect.height - gap;
				left = targetRect.left + (targetRect.width - popoverRect.width) / 2;
				if (top < 10) {
					newPosition = 'bottom';
					top = targetRect.bottom + gap;
				}
				break;

			case 'bottom':
				top = targetRect.bottom + gap;
				left = targetRect.left + (targetRect.width - popoverRect.width) / 2;
				if (top + popoverRect.height > viewportHeight - 10) {
					newPosition = 'top';
					top = targetRect.top - popoverRect.height - gap;
				}
				break;

			case 'left':
				top = targetRect.top + (targetRect.height - popoverRect.height) / 2;
				left = targetRect.left - popoverRect.width - gap;
				if (left < 10) {
					newPosition = 'right';
					left = targetRect.right + gap;
				}
				break;

			case 'right':
				top = targetRect.top + (targetRect.height - popoverRect.height) / 2;
				left = targetRect.right + gap;
				if (left + popoverRect.width > viewportWidth - 10) {
					newPosition = 'left';
					left = targetRect.left - popoverRect.width - gap;
				}
				break;
		}

		// Keep within viewport
		left = Math.max(10, Math.min(left, viewportWidth - popoverRect.width - 10));
		top = Math.max(10, Math.min(top, viewportHeight - popoverRect.height - 10));

		popoverRef.style.left = `${left}px`;
		popoverRef.style.top = `${top}px`;

		if (newPosition !== actualPosition) {
			actualPosition = newPosition;
		}
	}

	// Show tooltip (with optional delay)
	function show() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}

		if (delay > 0) {
			timeoutId = window.setTimeout(() => {
				isVisible = true;
			}, delay);
		} else {
			isVisible = true;
		}
	}

	// Hide tooltip with small buffer to allow moving between target and tooltip
	function hide() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}

		timeoutId = window.setTimeout(() => {
			isVisible = false;
		}, 50); // Small delay to allow transition
	}

	// Immediate show for focus
	function handleFocus() {
		show();
	}

	function handleBlur() {
		hide();
	}

	// Sync with popover API open state (optional, for debugging or animation sync)
	function handleToggle(event: Event) {
		const toggleEvent = event as ToggleEvent;
		if (toggleEvent.newState === 'open') {
			requestAnimationFrame(positionPopover);
		}
	}

	// Apply visibility to popover
	$effect(()=> {if (isVisible) {
		showTooltip();
	} else {
		hideTooltip();
	}})

	function showTooltip() {
		if (popoverRef) {
			try {
				popoverRef.showPopover();
				requestAnimationFrame(positionPopover);
			} catch (e) {
				console.warn('Popover API not supported, falling back to CSS positioning');
			}
		}
	}

	function hideTooltip() {
		if (popoverRef) {
			try {
				popoverRef.hidePopover();
			} catch (e) {
				// Ignore if already hidden
			}
		}
	}

	// Cleanup
	onDestroy(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});
</script>

{#if typeof text === 'string' || typeof text === 'function'}
	<!-- Main container -->
	<div
		class="tooltip-container"
		role="presentation"
		bind:this={targetRef}
		onmouseenter={show}
		onmouseleave={hide}
		onfocus={handleFocus}
		onblur={handleBlur}
	>
		{@render children()}
	</div>

	<!-- Popover tooltip content -->
	<div
		id={uniqueId}
		class="tooltip"
		class:top={actualPosition === 'top'}
		class:bottom={actualPosition === 'bottom'}
		class:left={actualPosition === 'left'}
		class:right={actualPosition === 'right'}
		class:no-pointer-events={disablePointerEvents}
		bind:this={popoverRef}
		popover="manual"
		role="tooltip"
		ontoggle={handleToggle}
		onmouseenter={show}
		onmouseleave={hide}
	>
		<!-- Text content or custom snippet -->
		{#if typeof text === 'string'}
			{text}
		{:else if typeof text === 'function'}
			{@render text()}
		{:else}
			...
		{/if}
	</div>
{:else}
	{@render children()}
{/if}

<style lang="scss">
  @use "$lib/client/styles/mixins/responsive" as resp;

  $bg: var(--bg, var(--color-background-secondary, #374151));
  $text: var(--text, var(--color-text-primary, white));

  .tooltip-container {
    display: inline-block;
    :global(*){
      vertical-align:middle;
    }
  }

  .tooltip.no-pointer-events {
    pointer-events: none;
  }

  // Hide tooltip on mobile
  @include resp.max-width(sm) {
    .tooltip {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;

      &:popover-open {
        display: none !important;
      }
    }
  }

  // Show on desktop
  @include resp.min-width(sm) {
    .tooltip {
      position: fixed;
      background-color: $bg;
      color: $text;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      border: none;
      margin: 0;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
      --arrow-size: 6px;
      overflow: hidden;
      z-index: 9999;

      // Arrow
      &::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
      }

      &.top::before {
        bottom: calc(-1 * var(--arrow-size));
        left: 50%;
        transform: translateX(-50%);
        border-width: var(--arrow-size) var(--arrow-size) 0 var(--arrow-size);
        border-color: $bg transparent transparent transparent;
      }

      &.bottom::before {
        top: calc(-1 * var(--arrow-size));
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 var(--arrow-size) var(--arrow-size) var(--arrow-size);
        border-color: transparent transparent $bg transparent;
      }

      &.left::before {
        right: calc(-1 * var(--arrow-size));
        top: 50%;
        transform: translateY(-50%);
        border-width: var(--arrow-size) 0 var(--arrow-size) var(--arrow-size);
        border-color: transparent transparent transparent $bg;
      }

      &.right::before {
        left: calc(-1 * var(--arrow-size));
        top: 50%;
        transform: translateY(-50%);
        border-width: var(--arrow-size) var(--arrow-size) var(--arrow-size) 0;
        border-color: transparent $bg transparent transparent;
      }

      // Animation when opened
      &:popover-open {
        animation: tooltip-fade-in 0.15s ease-out;
      }

      @starting-style {
        &:popover-open {
          opacity: 0;
          transform: scale(0.9);
        }
      }

      @keyframes tooltip-fade-in {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      // Hide when not open
      &:not(:popover-open) {
        display: none;
      }
    }

    // Fallback for browsers without popover API
    @supports not selector(:popover-open) {
      .tooltip {
        display: none;
        position: absolute;
      }
    }
  }
</style>
