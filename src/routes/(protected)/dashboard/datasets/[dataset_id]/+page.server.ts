import {Guard} from "$lib/server/helpers/guard.helper";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {form} from "$lib/server/helpers/form.helper";
import {type Actions, fail, redirect} from "@sveltejs/kit";
import {titleToName} from "$lib/server/helpers/string.helper";

export const load = Guard.load(async ({ params: {dataset_id} }) => {
    return {
        dataset: await DatasetRepository.getById(dataset_id)
    };
});

export const actions: Actions = {
    update: Guard.action(async ({ params: {dataset_id}, guard: { form } }) => {
        const title = form.string('dataset.title');
        const description = form.string('dataset.description');
        const policy_intent = form.string('dataset.policy_intent');

        // Retrieve dataset to check if it exists before updating
        const existingDataset = await DatasetRepository.getById(dataset_id);
        if (!existingDataset) {
            return fail(404, { message: 'Dataset not found' });
        }

        // Validate policyIntent if present
        const validPolicyIntents = ['PUBLIC', 'RESTRICTED', 'INTERNAL'];
        if (policy_intent && !validPolicyIntents.includes(policy_intent as any)) {
            return fail(400, { message: 'Invalid policy intent' });
        }

        // Perform the update using the repository
        try {
            const updated_dataset = await DatasetRepository.update(dataset_id, {
                title,
                description,
                policy_intent
            });

            


        } catch (err) {
            console.error('Error updating dataset:', err);
            return fail(500, { message: 'Failed to update dataset' });
        }
        return { success: true, type: 'update' };
    }, form.guard),

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
    }, form.guard),
};
