import {Guard} from "$lib/server/helpers/guard.helper";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";
import {form} from "$lib/server/helpers/form.helper";
import {type Actions, fail, redirect} from "@sveltejs/kit";
import {LdnRepository} from "$lib/server/repositories/ldn.repository";
import {LDESEventRepository} from "$lib/server/repositories/ldes.repository";
import {randomUUID} from "node:crypto";
import {PolicyIntent} from "@prisma/client";
import {PolicyRepository} from "$lib/server/repositories/policy.repository";
import {env} from "@sourceregistry/node-env";
import {Service} from "@sourceregistry/svelte-service-manager";

export const load = Guard.load(async ({params: {dataset_id}}) => {
    return {
        dataset: await DatasetRepository.getById(dataset_id)
    };
});

export const actions: Actions = {
    update: Guard.action(async ({params: {dataset_id}, guard: {form}}) => {
        if (!dataset_id) return fail(400)
        const title = form.string('dataset.title');
        const description = form.string('dataset.description');
        const policy_intent = form.enum$('dataset.policy_intent', PolicyIntent, ({value}) => `Invalid policy intent ${value}`);
        const policy_raw = form.string('dataset.policy.raw');

        // Retrieve dataset
        const existingDataset = await DatasetRepository.getById(dataset_id);
        if (!existingDataset) return fail(404, {message: 'Dataset not found'});


        let policy_id = existingDataset.policy_id;

        if (policy_intent === 'RESTRICTED' && !policy_id) {
            const {id} = await PolicyRepository.create({
                package: `ds4sscc/policy/${dataset_id}`,
                name: `policy@${existingDataset.id}`,
                datasets: [existingDataset],
                raw: policy_raw || `pacakge ds4sscc.policy.${dataset_id}\n\n\n\nallow = false`
            })
            policy_id = id;
        } else if (policy_id && policy_raw) {
            await PolicyRepository.update({
                id: policy_id,
                raw: policy_raw
            })
            await Service('policy').load({id: policy_id})
        }

        // Perform update
        const updatedDataset = await DatasetRepository.update(dataset_id, {
            title,
            description,
            policy_intent,
            policy_id
        });

        // 🔔 Only notify if the dataset is published (i.e., visible to consumers)
        if (updatedDataset.is_published) {
            const notification = {
                '@context': 'https://www.w3.org/ns/ldn-context.jsonld',
                id: `urn:notification:${randomUUID()}`,
                type: 'Notification',
                published: new Date().toISOString(),
                actor: {
                    id: env.string("PUBLIC_BASE_URL"),
                    type: 'Application',
                    name: 'Your Dataspace'
                },
                object: {
                    '@id': `${env.string("PUBLIC_BASE_URL")}/datasets/${updatedDataset.id}`,
                    '@type': 'dcat:Dataset',
                    'dct:title': updatedDataset.title
                },
                summary: `Dataset "${updatedDataset.title}" has been updated.`
            };

            // 📜 Create LDES event
            await LDESEventRepository.create({
                dataset: updatedDataset,
                event_type: 'DatasetUpdated',
                version_of: `${env.string("PUBLIC_BASE_URL")}/datasets/${updatedDataset.id}`,
                event_data: {
                    '@context': [
                        'https://www.w3.org/ns/dcat.jsonld',
                        'https://w3c.github.io/ldes/context.jsonld'
                    ],
                    '@id': `${env.string("PUBLIC_BASE_URL")}/datasets/${updatedDataset.id}`,
                    '@type': 'dcat:Dataset',
                    'dct:title': updatedDataset.title,
                    'dct:description': updatedDataset.description,
                    'dct:identifier': updatedDataset.identifier,
                    'dcat:theme': updatedDataset.theme,
                    'dct:license': updatedDataset.license,
                    'dcat:accessURL': updatedDataset.access_url,
                    'dct:issued': updatedDataset.issued?.toISOString(),
                    'dct:modified': new Date().toISOString() // ← updated now!
                }
            });

            // 📣 Broadcast LDN
            await LdnRepository.broadcast(updatedDataset.id, notification, 'Updated');
        }

        return {success: true, type: 'update'};
    }, form.guard),

    // Action to delete the dataset
    delete: Guard.action(async ({params}) => {
        const {dataset_id} = params;

        if (!dataset_id) {
            return fail(400, {message: 'Dataset ID is required'});
        }

        // Retrieve dataset to check if it exists before deleting
        const existingDataset = await DatasetRepository.getById(dataset_id);
        if (!existingDataset) {
            return fail(404, {message: 'Dataset not found'});
        }

        // Perform the deletion using the repository
        try {
            await DatasetRepository.delete(dataset_id);
        } catch (err) {
            console.error('Error deleting dataset:', err);
            return fail(500, {message: 'Failed to delete dataset'});
        }

        // Redirect to the main datasets list page after successful deletion
        redirect(303, '/dashboard/datasets');
    }, form.guard),
};
