// src/lib/server/repositories/dataset.repository.ts

import {prisma} from '$lib/server/configurations/prisma.config';
import type {Catalog, Dataset, PolicyIntent} from '@prisma/client';

// Type voor het importeren van een dataset (alleen metadata, geen id/createdAt)
type ImportDatasetData = Omit<
    Dataset,
    'id' | 'importedAt' | 'publishedAt' | 'catalogId'
> & {
    catalogId: string;
};

// Type voor het updaten van publicatie-instellingen
type UpdatePublishSettings = {
    isPublished?: boolean;
    policyIntent?: PolicyIntent;
    notes?: string;
};

export const DatasetRepository = {
    /**
     * Haalt alle datasets op die gekoppeld zijn aan een specifieke catalogus.
     */
    getByCatalogId: (catalog_id: string): Promise<Dataset[]> =>
        prisma.dataset.findMany({
            where: {catalog_id},
            include: {
                catalog: true
            },
            orderBy: {title: 'asc'}
        }),
    /**
     * Creëert een nieuwe dataset handmatig (bijv. voor eigen sandbox-data zoals "Inzicht Verlicht").
     * Gebruik dit voor datasets die NIET afkomstig zijn uit een externe catalogus.
     * @param data - Metadata conform jouw Prisma Dataset-model
     * @returns De aangemaakte Dataset
     */
    create: (data: Omit<Dataset, 'id' | 'imported_at' | 'published_at'>): Promise<Dataset> =>
        prisma.dataset.create({
            data: {
                ...data,
                // Zorg dat publishedAt alleen wordt gezet als direct gepubliceerd
                published_at: data.is_published ? new Date() : undefined
            }
        }),

    /**
     * Werkt een bestaande dataset bij (metadata of publicatie-instellingen).
     * @param id - ID van de dataset
     * @param data - Partiële update (alle velden optioneel)
     * @returns De bijgewerkte Dataset
     */
    update: (id: string, data: Partial<Omit<Dataset, 'id' | 'imported_at'>>) =>
        prisma.dataset.update({
            where: {id},
            data: {
                ...data
            }
        }),

    /**
     * Verwijdert een dataset permanent.
     * @param id - ID van de dataset
     * @returns De verwijderde Dataset
     */
    delete: (id: string): Promise<Dataset> =>
        prisma.dataset.delete({
            where: {id}
        }),

    /**
     * Verwijdert alle datasets die gekoppeld zijn aan een catalogus (handig bij catalogus-verwijdering).
     * @returns Aantal verwijderde datasets
     * @param catalog_id
     */
    deleteByCatalogId: async (catalog_id: string): Promise<number> => {
        const datasets = await prisma.dataset.findMany({
            where: {catalog_id},
            select: {id: true}
        });

        if (datasets.length === 0) return 0;

        await prisma.dataset.deleteMany({
            where: {catalog_id}
        });

        return datasets.length;
    },

    /**
     * Haalt alle datasets op uit de database.
     */
    getAll: (): Promise<Dataset[]> =>
        prisma.dataset.findMany({
            orderBy: {title: 'asc'}
        }),
    getAllWithCatalog: (): Promise<(Dataset & { catalog: Catalog })[]> =>
        prisma.dataset.findMany({
            include: {catalog: true},
            orderBy: {title: 'asc'}
        }),

    /**
     * Haalt één dataset op aan de hand van het lokale Prisma ID.
     * @param id - Het unieke ID van de dataset in de lokale database.
     * @returns De gevonden Dataset of null als deze niet bestaat.
     */
    getById: (id: string) =>
        prisma.dataset.findUniqueOrThrow({
            where: {
                id
            },
            include: {catalog: true, policy: true}
        }),
};
