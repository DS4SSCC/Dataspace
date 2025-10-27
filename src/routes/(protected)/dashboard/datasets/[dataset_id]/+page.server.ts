import {Guard} from "$lib/server/helpers/guard.helper";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {form} from "$lib/server/helpers/form.helper";
import {type Actions, fail, redirect} from "@sveltejs/kit";

export const load = Guard.load(async ({ params: {dataset_id} }) => {
    return {
        dataset: await DatasetRepository.getById(dataset_id)
    };
});

// Define the actions for updating and deleting the dataset
export const actions: Actions = {
    // Action to update dataset properties (e.g., isPublished, policyIntent)
    update: Guard.action(async ({ request, params }) => {
        const { dataset_id } = params;
        const formData = await request.formData();

        if (!dataset_id) {
            return fail(400, { message: 'Dataset ID is required' });
        }

        // Retrieve dataset to check if it exists before updating
        const existingDataset = await DatasetRepository.getById(dataset_id);
        if (!existingDataset) {
            return fail(404, { message: 'Dataset not found' });
        }

        // Get values from form data
        const isPublished = formData.get('isPublished') === 'on'; // SvelteKit checkbox sends 'on' if checked
        const policyIntent = formData.get('policyIntent'); // Should be 'PUBLIC', 'RESTRICTED', 'INTERNAL'

        // Validate policyIntent if present
        const validPolicyIntents = ['PUBLIC', 'RESTRICTED', 'INTERNAL'];
        if (policyIntent && !validPolicyIntents.includes(policyIntent as any)) {
            return fail(400, { message: 'Invalid policy intent' });
        }

        // Prepare update data object
        const updateData: Partial<{
            isPublished: boolean;
            policyIntent: 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
        }> = {};

        if (formData.has('isPublished')) {
            updateData.isPublished = isPublished;
        }
        if (policyIntent) {
            updateData.policyIntent = policyIntent as 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
        }

        // Perform the update using the repository
        try {
            await DatasetRepository.update(dataset_id, updateData);
        } catch (err) {
            console.error('Error updating dataset:', err);
            return fail(500, { message: 'Failed to update dataset' });
        }

        // Optionally, return success message or redirect
        // For a smoother UX, you might just return success and let the page reload or update reactively
        // Or redirect back to the same page to show updated values:
        // redirect(303, `/dashboard/datasets/${dataset_id}`);

        // Or return success data if using on:submit with feedback
        return { success: true, type: 'update' };
    }, form.guard), // Assuming you use a form guard helper

    // Action to delete the dataset
    delete: Guard.action(async ({ params }) => {
        const { dataset_id } = params;

        if (!dataset_id) {
            return fail(400, { message: 'Dataset ID is required' });
        }

        // Retrieve dataset to check if it exists before deleting
        const existingDataset = await DatasetRepository.getById(dataset_id);
        if (!existingDataset) {
            return fail(404, { message: 'Dataset not found' });
        }

        // Perform the deletion using the repository
        try {
            await DatasetRepository.delete(dataset_id);
        } catch (err) {
            console.error('Error deleting dataset:', err);
            return fail(500, { message: 'Failed to delete dataset' });
        }

        // Redirect to the main datasets list page after successful deletion
        redirect(303, '/dashboard/datasets');
    }, form.guard), // Assuming you use a form guard helper
};
