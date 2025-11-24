import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {LdnRepository} from "$lib/server/repositories/ldn.repository";

export const POST: RequestHandler = async ({ params, request }) => {
    const datasetId = params.dataset_id;
    const notification = await request.json();

    // Process the LDN notification
    // Store in your notification queue/database
    // Trigger appropriate actions based on the notification content

    return json({
        success: true,
        message: 'Notification received',
        inbox: datasetId
    }, { status: 201 });
};

export const GET: RequestHandler = async ({ params: {dataset_id} }) => {

    // Return the LDN inbox contents
    const notifications = await LdnRepository.getByDatasetId(dataset_id)

    return json({
        '@context': 'https://www.w3.org/ns/ldn',
        id: `/datasets/${dataset_id}/ldes`,
        type: 'ldp:BasicContainer',
        'ldp:contains': notifications
    });
};
