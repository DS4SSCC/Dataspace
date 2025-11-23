// src/lib/server/repositories/dataset.repository.ts

import {prisma} from '$lib/server/configurations/prisma.config';
import type {Catalog, Dataset, PolicyIntent} from '@prisma/client';
import {CatalogRepository} from './catalog.repository';

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
    create: (data: Omit<Dataset, 'id' | 'importedAt' | 'publishedAt'>): Promise<Dataset> =>
        prisma.dataset.create({
            data: {
                ...data,
                // Zorg dat publishedAt alleen wordt gezet als direct gepubliceerd
                publishedAt: data.isPublished ? new Date() : undefined
            }
        }),

    /**
     * Werkt een bestaande dataset bij (metadata of publicatie-instellingen).
     * @param id - ID van de dataset
     * @param data - Partiële update (alle velden optioneel)
     * @returns De bijgewerkte Dataset
     */
    update: (id: string, data: Partial<Omit<Dataset, 'id' | 'importedAt'>>): Promise<Dataset> =>
        prisma.dataset.update({
            where: {id},
            data: {
                ...data,
                // Zet publishedAt alleen de eerste keer dat isPublished true wordt
                publishedAt:
                    data.isPublished === true
                        ? // Haal bestaande waarde op om te checken of al gepubliceerd
                        prisma.dataset
                            .findUnique({where: {id}})
                            .then(ds => ds?.publishedAt || new Date())
                        : undefined
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
     * @param catalogId - ID van de catalogus
     * @returns Aantal verwijderde datasets
     */
    deleteByCatalogId: async (catalogId: string): Promise<number> => {
        const datasets = await prisma.dataset.findMany({
            where: {catalogId},
            select: {id: true}
        });

        if (datasets.length === 0) return 0;

        await prisma.dataset.deleteMany({
            where: {catalogId}
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
    getById: (id: string): Promise<Dataset | null> =>
        prisma.dataset.findUnique({
            where: {
                id
            },
            include: {catalog: true}
        }),
};
