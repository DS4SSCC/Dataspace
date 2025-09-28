<script lang="ts">
    import iconsData from 'bootstrap-icons/font/bootstrap-icons.json';

    const validIcons = new Set(Object.keys(iconsData));

	interface Props {
		icon: string | undefined;
        fallback?: string | undefined;
		margin?: 'left' | 'right' | 'top' | 'bottom';
		color?: string | undefined;
		rotation?: string | undefined;
		spin?: boolean | undefined;
		style?: string;
		[key: string]: any;
	}

	let {
		icon,
        fallback = 'question-diamond',
		margin,
		color = undefined,
		rotation = undefined,
		spin = false,
		style,
		...restProps
	}: Props = $props();

	// Function to check if the icon class exists
    function isValidIcon(iconName: string): boolean {
        return validIcons.has(iconName);
    }

	const computedStyle = $derived.by(()=> {
        let _style = style ?? '';
        if (margin) _style += `margin-${margin}: .5rem;`;
        if (color) _style += `color: ${color};`;
        if (rotation) _style += `--rotate: ${rotation};`;
        return _style;
    })

	// Reactive icon class check
	let iconClass = $derived(icon ? `bi bi-${icon}` : '');
	let fallbackClass = $derived(fallback ? `bi-${fallback}` : undefined);
	// Reactive final icon to be used (with fallback)
    let finalIcon = $derived.by(() =>
        icon && isValidIcon(icon) ? iconClass : fallbackClass
    );

	let __class__ = $derived(`icon ${finalIcon}${restProps.class ? ` ${restProps.class}` : ''}${spin ? ` spin` : ''}`);
</script>

<i class={__class__} style={computedStyle} title={restProps.title ?? null}></i>

<style lang="scss">
  i::before {
    transition: var(--transition, 0.3s);
    transform: rotate(var(--rotate, 0deg));
    color: var(--color, inherit);
  }
	i.spin::before {
    animation: rotation var(--spin-speed, 1.5s) linear infinite;

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
</style>
