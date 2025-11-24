// src/lib/server/repositories/ldes-event.repository.ts

import { prisma } from '$lib/server/configurations/prisma.config';

export const LDESEventRepository = {
    /**
     * Creates a new LDES event (e.g. when a dataset is published or updated).
     */
    create: (data: {
        dataset: {
            id: string,
        },
        event_type: 'DatasetPublished' | 'DatasetUpdated',
        event_data: object,
        version_of?: string,
        previous?: string,

    }) =>
        prisma.LDESEvent.create({
            data: {
                dataset: {
                    connect: {
                        id: data.dataset.id
                    }
                },
                event_type: data.event_type || 'DatasetUpdated',
                event_data: data.event_data,
                previous: data.previous
            }
        }),

    /**
     * Retrieves all events for a specific dataset (for audit or replay).
     */
    getByDatasetId: (dataset_id: string) =>
        prisma.LDESEvent.findMany({
            where: { dataset_id },
            orderBy: { timestamp: 'desc' }
        }),

    /**
     * Retrieves events in chronological order (for LDES stream endpoint).
     */
    getAll: (limit: number = 100, cursor?: string) =>
        prisma.LDESEvent.findMany({
            take: limit,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0, // skip cursor itself
            orderBy: { timestamp: 'asc' }
        }),

    /**
     * Gets the latest event for a dataset (e.g. to build version chain).
     */
    getLatestByDatasetId: (dataset_id: string) =>
        prisma.LDESEvent.findFirst({
            where: { dataset_id },
            orderBy: { timestamp: 'desc' }
        })
};
