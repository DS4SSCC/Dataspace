import {writable} from 'svelte/store';

export interface ToastOptions {
    duration?: number;
    initial?: number;
    dismissable?: boolean;
    progress?: boolean;
    icon?: string;
    style?: string;
    intro?: { x?: number, y?: number };
}

const defaults: ToastOptions = {
    duration: 4000,
    initial: 1,
    dismissable: true,
    progress: true,
    intro: {x: 256}
};

// Toast structure, including the message and options
export interface Toast {
    id: string;
    title: string | null;
    message: string;
    options: ToastOptions;
}

export type ToastController = {
    readonly id: string;
    dismiss(): void;
}

// Toast store to hold the list of toasts
export const toasts = writable<Toast[]>([]);

// Function to add a new toast
export function addToast(message: string, title: string | null = null, options: ToastOptions = defaults) {
    const id = Math.random().toString(36).substring(2, 9);  // Generate a unique id for the toast
    const newToast: Toast = {id, title, message, options: {...defaults, ...options}};

		if (newToast.options.duration === -1){
			newToast.options.dismissable = true;
			newToast.options.progress = false;
		}

    toasts.update(currentToasts => [
        ...currentToasts,
        newToast
    ]);

	if (newToast.options.duration !== -1){
		// Remove toast after duration
		setTimeout(() => {
			removeToast(id);
		}, newToast.options.duration);
	}



    return {
        get id() {
            return id;
        },
        dismiss: () => removeToast(id)
    }
}

// Function to remove a toast by id
export function removeToast(id: string) {
    toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
}
