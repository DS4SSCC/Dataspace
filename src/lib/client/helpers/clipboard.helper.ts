export async function copyToClipboard(text: string) {
	if (navigator.clipboard && navigator.clipboard.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			// console.log('Text copied to clipboard');
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	} else {
		console.warn('Clipboard API is not supported in this environment.');
	}
}
