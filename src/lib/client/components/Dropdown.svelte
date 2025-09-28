<script lang="ts">
	import Button from '$lib/client/components/Button.svelte';
	import { clickOutside } from '$lib/client/actions/clickOutside';
	import Icon from '$lib/client/components/icons/Icon.svelte';
	import { onMount, onDestroy, type Snippet, tick } from 'svelte';
	import Flexbox from '$lib/client/components/Flexbox.svelte';

	interface Props {
		show?: boolean;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | undefined;
		alignHorizontal?: 'left' | 'center' | 'right';
		alignVertical?: 'top' | 'center' | 'bottom';
		transparent?: boolean;
		style?: string;
		styleButton?: string;
		icon?: boolean;
		hideOnClick?: boolean;
		spacing?: number;
		menu?: Snippet;
		children?: Snippet;
		button_children?: Snippet;
		class?: string;
	}

	let {
		show = $bindable(false),
		size = undefined,
		alignHorizontal = 'left',
		alignVertical = 'bottom',
		transparent = false,
		icon = true,
		hideOnClick = true,
		spacing = 4,
		menu,
		children,
		button_children,
		class: clzz,
		style,
		styleButton,
		...restProps
	}: Props = $props();

	let anchorEl: HTMLElement | undefined = $state();
	let menuEl: HTMLElement | undefined = $state();
	let isOpen = $state(false);
	let scrollCheckTimeout: number;
	let positionUpdateQueued = false;
	let resizeObserver: ResizeObserver | null = null;
	let scrollableAncestors: Element[] = [];
	let offScreenCheckInterval: number;

	// Check if element is completely off-screen
	function isElementOffScreen(element: HTMLElement): boolean {
		const rect = element.getBoundingClientRect();
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// Consider element off-screen if it's completely outside viewport
		return (
			rect.right < 0 ||
			rect.left > windowWidth ||
			rect.bottom < 0 ||
			rect.top > windowHeight
		);
	}

	// Get all scrollable ancestors of an element
	function getScrollableAncestors(element: Element): Element[] {
		const ancestors: Element[] = [];
		let parent = element.parentElement;

		while (parent) {
			// Check if element has scrollable content
			const style = window.getComputedStyle(parent);
			const overflowY = style.overflowY;
			const overflowX = style.overflowX;

			if (
				(overflowY === 'scroll' || overflowY === 'auto') && parent.scrollHeight > parent.clientHeight ||
				(overflowX === 'scroll' || overflowX === 'auto') && parent.scrollWidth > parent.clientWidth
			) {
				ancestors.push(parent);
			}

			parent = parent.parentElement;
		}

		// Add window as scrollable ancestor
		ancestors.push(window);

		return ancestors;
	}

	// Setup observers for anchor and scrollable ancestors
	function setupObservers() {
		if (!anchorEl) return;

		// Get scrollable ancestors
		scrollableAncestors = getScrollableAncestors(anchorEl);

		// Create ResizeObserver if needed
		if (!resizeObserver) {
			resizeObserver = new ResizeObserver((entries) => {
				if (show && !positionUpdateQueued) {
					positionUpdateQueued = true;
					requestAnimationFrame(() => {
						updatePosition();
						positionUpdateQueued = false;
					});
				}
			});
		}

		// Observe anchor element
		resizeObserver.observe(anchorEl);

		// Observe scrollable ancestors
		scrollableAncestors.forEach(ancestor => {
			if (ancestor !== window) {
				resizeObserver.observe(ancestor);
			}

			// Add scroll event listeners
			ancestor.addEventListener('scroll', handleScroll, { passive: true });
		});

		// Set up periodic check for off-screen anchor
		offScreenCheckInterval = window.setInterval(() => {
			if (show && anchorEl && isElementOffScreen(anchorEl)) {
				show = false;
			}
		}, 200); // Check every 200ms
	}

	// Clean up observers and listeners
	function cleanupObservers() {
		// Clear interval
		if (offScreenCheckInterval) {
			clearInterval(offScreenCheckInterval);
			offScreenCheckInterval = 0;
		}

		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}

		scrollableAncestors.forEach(ancestor => {
			ancestor.removeEventListener('scroll', handleScroll);
		});

		scrollableAncestors = [];
	}

	async function updatePosition() {
		if (!anchorEl || !menuEl || !show) return;

		// Check if anchor is off-screen
		if (isElementOffScreen(anchorEl)) {
			show = false;
			return;
		}

		// Reset any previously set dimensions
		menuEl.style.maxHeight = '';
		menuEl.style.maxWidth = '';

		// Force a reflow to ensure accurate measurements
		menuEl.style.display = 'block';
		menuEl.style.visibility = 'hidden';
		menuEl.style.left = '0';
		menuEl.style.top = '0';

		await tick();

		const anchor = anchorEl.getBoundingClientRect();
		const menu = menuEl.getBoundingClientRect();
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// Check if anchor is too far off-screen (with threshold)
		const offScreenThreshold = 100;
		if (
			anchor.bottom < -offScreenThreshold ||
			anchor.top > windowHeight + offScreenThreshold ||
			anchor.right < -offScreenThreshold ||
			anchor.left > windowWidth + offScreenThreshold
		) {
			show = false;
			return;
		}

		// Calculate available space in all directions
		const spaceAbove = anchor.top;
		const spaceBelow = windowHeight - anchor.bottom;
		const spaceLeft = anchor.left;
		const spaceRight = windowWidth - anchor.right;

		// Determine best vertical position
		let menuPosY;
		if (alignVertical === 'top') {
			// Prefer top alignment if there's enough space
			if (spaceAbove >= menu.height + spacing) {
				menuPosY = anchor.top - menu.height - spacing;
			}
			// Otherwise try bottom alignment
			else if (spaceBelow >= menu.height + spacing) {
				menuPosY = anchor.bottom + spacing;
			}
			// If neither fits, use the side with more space
			else {
				menuPosY = spaceAbove > spaceBelow
					? Math.max(8, anchor.top - menu.height - spacing)
					: Math.min(windowHeight - menu.height - 8, anchor.bottom + spacing);
			}
		}
		else if (alignVertical === 'bottom') {
			// Prefer bottom alignment if there's enough space
			if (spaceBelow >= menu.height + spacing) {
				menuPosY = anchor.bottom + spacing;
			}
			// Otherwise try top alignment
			else if (spaceAbove >= menu.height + spacing) {
				menuPosY = anchor.top - menu.height - spacing;
			}
			// If neither fits, use the side with more space
			else {
				menuPosY = spaceBelow > spaceAbove
					? Math.min(windowHeight - menu.height - 8, anchor.bottom + spacing)
					: Math.max(8, anchor.top - menu.height - spacing);
			}
		}
		else { // center
			menuPosY = anchor.top + (anchor.height / 2) - (menu.height / 2);
			// If center position goes off-screen, adjust to the side with more space
			if (menuPosY < 8) {
				menuPosY = 8;
			} else if (menuPosY + menu.height > windowHeight - 8) {
				menuPosY = windowHeight - menu.height - 8;
			}
		}

		// Determine best horizontal position
		let menuPosX;
		if (alignHorizontal === 'left') {
			// Prefer left alignment if there's enough space
			if (spaceLeft + anchor.width >= menu.width) {
				menuPosX = anchor.left;
			}
			// Otherwise try right alignment
			else if (spaceRight + anchor.width >= menu.width) {
				menuPosX = anchor.right - menu.width;
			}
			// If neither fits, use the side with more space
			else {
				menuPosX = spaceLeft > spaceRight
					? Math.max(8, anchor.left)
					: Math.min(windowWidth - menu.width - 8, anchor.right - menu.width);
			}
		}
		else if (alignHorizontal === 'right') {
			// Prefer right alignment if there's enough space
			if (spaceRight + anchor.width >= menu.width) {
				menuPosX = anchor.right - menu.width;
			}
			// Otherwise try left alignment
			else if (spaceLeft + anchor.width >= menu.width) {
				menuPosX = anchor.left;
			}
			// If neither fits, use the side with more space
			else {
				menuPosX = spaceRight > spaceLeft
					? Math.min(windowWidth - menu.width - 8, anchor.right - menu.width)
					: Math.max(8, anchor.left);
			}
		}
		else { // center
			menuPosX = anchor.left + (anchor.width / 2) - (menu.width / 2);
			// If center position goes off-screen, adjust to the side with more space
			if (menuPosX < 8) {
				menuPosX = 8;
			} else if (menuPosX + menu.width > windowWidth - 8) {
				menuPosX = windowWidth - menu.width - 8;
			}
		}

		// Final clamping to ensure menu stays within viewport
		menuPosX = Math.max(8, Math.min(menuPosX, windowWidth - menu.width - 8));
		menuPosY = Math.max(8, Math.min(menuPosY, windowHeight - menu.height - 8));

		// Apply position
		menuEl.style.left = `${menuPosX}px`;
		menuEl.style.top = `${menuPosY}px`;
		menuEl.style.visibility = 'visible';

		// Adjust dimensions if menu is still too large
		if (menuPosY + menu.height > windowHeight - 8) {
			menuEl.style.maxHeight = `${windowHeight - menuPosY - 8}px`;
		}
		if (menuPosX + menu.width > windowWidth - 8) {
			menuEl.style.maxWidth = `${windowWidth - menuPosX - 8}px`;
		}
	}

	// Handle show/hide with proper animation
	$effect(() => {
		if (show && menuEl) {
			// Show the popover first
			if (!menuEl.matches(':popover-open')) {
				menuEl.showPopover();
			}

			// Setup observers for scrollable containers
			setupObservers();

			// Queue position update after rendering
			if (!positionUpdateQueued) {
				positionUpdateQueued = true;
				requestAnimationFrame(async () => {
					await updatePosition();
					positionUpdateQueued = false;

					// Trigger animation after positioning
					setTimeout(() => {
						isOpen = true;
					}, 10);
				});
			}
		} else if (!show) {
			// Start close animation
			isOpen = false;
			positionUpdateQueued = false;

			// Clean up observers
			cleanupObservers();

			// Hide popover after animation completes
			setTimeout(() => {
				if (!show && menuEl?.matches(':popover-open')) {
					menuEl.hidePopover();
				}
			}, 200);
		}
	});

	// Smooth scroll handling with throttling
	function handleScroll() {
		if (!show) return;
		clearTimeout(scrollCheckTimeout);
		scrollCheckTimeout = setTimeout(() => {
			updatePosition();
		}, 16); // ~60fps
	}

	// Resize handling
	function handleResize() {
		if (show) {
			updatePosition();
		}
	}

	// Clean up on component destroy
	onDestroy(() => {
		cleanupObservers();
	});

	onMount(() => {
		if (show) {
			updatePosition();
		}
	});
</script>

<svelte:window
	onresize={handleResize}
	onkeydown={(e) => {if(e.key === "Escape") show = false}}
/>

<div class="dropdown{clzz ? ` ${clzz}` : ''}" class:show use:clickOutside={() => show = false} bind:this={anchorEl}>
	<Button onclick={() => {show = !show}} {size} {transparent} {...restProps} style={styleButton}>
		{#if button_children}
			{@render button_children()}
		{:else}
			{#if icon}
				<Icon icon="three-dots-vertical" />
			{/if}
		{/if}
	</Button>
	<div
		class="dropdown-menu"
		class:open={isOpen}
		{style}
		popover
		bind:this={menuEl}
		onclick={() => {if(hideOnClick) show = false}}
		role="presentation"
	>
		<div class="menu-content">
			<Flexbox direction="column" align="flex-start">
				{#if menu}
					{@render menu()}
				{:else}
					{@render children?.()}
				{/if}
			</Flexbox>
		</div>
	</div>
</div>

<style lang="scss">
  @use "sass:map";
  @use "$lib/client/styles/base/variables" as variables;

  .dropdown {
    position: relative;
    display: inline-flex;

    .dropdown-menu[popover] {
      background: var(--color-background-secondary);
      border: solid 1px var(--color-border-primary);
      border-radius: map.get(variables.$border-radii, "md");
      min-width: var(--width);
      max-width: calc(100vw - 24px);
      box-shadow: map.get(variables.$shadows, "md");
      overflow: hidden;
      color: var(--color-text-primary);
      padding: map.get(variables.$spacings, "sm");

      /* Initial collapsed state */
      opacity: 0;
      transform: translateY(-8px);
      visibility: hidden;

      /* Smooth transitions */
      transition:
              opacity 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              visibility 0s linear 200ms;

      /* When open */
      &.open {
        opacity: 1;
        transform: translateY(0);
        visibility: visible;
        transition:
                opacity 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                visibility 0s linear 0s;

        .menu-content {
          padding: 0;
          opacity: 1;
        }
      }

      .menu-content {
        padding: 0;
        opacity: 0;
        transition:
                padding 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                opacity 150ms ease-out 50ms;

        /* Add scrolling for oversized content */
        overflow-y: auto;
        max-height: inherit;
      }
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dropdown .dropdown-menu[popover] {
      max-width: calc(100vw - 16px);
    }
  }
</style>
