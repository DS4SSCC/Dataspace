import { browser } from '$app/environment';

// Track active modals by ID
let activeModals = $state(new Set());
let modalPortalTargets = $state(new Map());

export const modals = {
    /**
     * Register a modal as open
     * @param {string} id - Unique modal identifier
     * @param {HTMLElement|null} portalTarget - Portal target element
     */
    open(id:string, portalTarget: HTMLElement | null = null) {
        if (!browser || !id) return;

        activeModals.add(id);
        if (portalTarget) {
            modalPortalTargets.set(id, portalTarget);
        }

        this._updateClasses();
    },

    /**
     * Register a modal as closed
     * @param {string} id - Unique modal identifier
     */
    close(id: string) {
        if (!browser || !id) return;

        activeModals.delete(id);
        modalPortalTargets.delete(id);

        this._updateClasses();
    },

    /**
     * Check if a specific modal is open
     * @param {string} id - Modal identifier
     * @returns {boolean}
     */
    isOpen(id: string) {
        return activeModals.has(id);
    },

    /**
     * Check if any modals are open
     * @returns {boolean}
     */
    get hasActiveModals(): boolean {
        return activeModals.size > 0;
    },

    /**
     * Get count of active modals
     * @returns {number}
     */
    get count(): number {
        return activeModals.size;
    },

    /**
     * Update body and portal classes based on active modals
     * @private
     */
    _updateClasses() {
        if (!browser) return;

        if (this.hasActiveModals) {
            document.body.classList.add('modal-show');
            // Add class to all unique portal targets
            const uniqueTargets = new Set(modalPortalTargets.values());
            uniqueTargets.forEach(target => {
                if (target instanceof HTMLElement && target !== document.body) {
                    target.classList.add('modal-show');
                }
            });
        } else {
            document.body.classList.remove('modal-show');
            // Remove class from all portal targets
            const allTargets = new Set(modalPortalTargets.values());
            allTargets.forEach(target => {
                if (target instanceof HTMLElement) {
                    target.classList.remove('modal-show');
                }
            });
            // Clear targets map to prevent memory leaks
            modalPortalTargets.clear();
        }
    },

    /**
     * Get all currently active modal IDs
     * @returns {string[]}
     */
    getActiveModalIds() {
        return Array.from(activeModals);
    }
};
