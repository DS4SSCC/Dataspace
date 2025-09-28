/* usage:
 * <script>
 * import { clickOutside } from '$lib/client/actions/clickOutside';
 *
 * const handleClickOutside = () => {
 * 	show = false;
 * };
 *
 * </script>
 *
 * <div use:clickOutside={handleClickOutside}>click outside of me</div>
 * */

export function clickOutside(node: HTMLElement, callback: (event: MouseEvent) => void) {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) {
			callback(event);
		}
	};

	document.addEventListener('click', handleClick);

	return {
		destroy() {
			document.removeEventListener('click', handleClick);
		}
	};
}
