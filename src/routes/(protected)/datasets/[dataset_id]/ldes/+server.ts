import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {LDESEventRepository} from "$lib/server/repositories/ldes.repository";

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

export const GET: RequestHandler = async ({ params: {dataset_id}, url }) => {
    const limitParam = Number(url.searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, limitParam)) : 100;

    const events = await LDESEventRepository.getByDatasetId(dataset_id);
    const members = events.slice(0, limit).map((event) => ({
        id: event.id,
        type: event.event_type,
        timestamp: event.timestamp.toISOString(),
        version_of: event.version_of,
        previous: event.previous,
        data: event.event_data
    }));

    return json({
        '@context': [
            'https://w3c.github.io/ldes/context.jsonld',
            'https://www.w3.org/ns/ldp'
        ],
        id: `/datasets/${dataset_id}/ldes`,
        type: 'ldes:EventStream',
        'ldp:contains': members
    });
};
