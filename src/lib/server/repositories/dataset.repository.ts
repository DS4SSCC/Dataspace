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
     * Importeert datasets van een externe catalogus (via adapter) en slaat de metadata op.
     * Bestaande datasets (zelfde catalogId + identifier) worden bijgewerkt.
     * @param catalogId - ID van de lokale catalogus
     * @returns Aantal geïmporteerde/bijgewerkte datasets
     */
    async importFromCatalog(catalogId: string): Promise<number> {
        // 1. Haal DCAT-AP datasets op via de catalog repository (gebruikt jouw bestaande adapter-logica)
        const dcatDatasets = await CatalogRepository.getDatasetsFromCatalog(catalogId);

        if (!dcatDatasets.length) return 0;

        // 2. Transformeer naar Prisma-compatible data
        const importData: ImportDatasetData[] = dcatDatasets.map(ds => ({
            catalogId,
            title: ds.title,
            description: ds.description || '',
            identifier: ds.id,
            issued: ds.issued ? new Date(ds.issued) : null,
            modified: ds.modified ? new Date(ds.modified) : null,
            language: ds.language || null,
            theme: ds.themes?.[0] || null, // neem eerste theme (Prisma ondersteunt nu 1 string)
            spatial: ds.spatial || null,
            temporalStart: ds.temporalStart ? new Date(ds.temporalStart) : null,
            temporalEnd: ds.temporalEnd ? new Date(ds.temporalEnd) : null,
            license: ds.license?.id || null,
            accessRights: ds.accessRights?.id || null,
            accessUrl: ds.distributions?.find(d => d.accessUrl)?.accessUrl || null,
            downloadUrl: ds.distributions?.find(d => d.downloadUrl)?.downloadUrl || null,
            mediaType: ds.distributions?.[0]?.mediaType || null,
            isPublished: false, // standaard niet publiceren
            policyIntent: 'PUBLIC', // standaard openbaar (kan later aangepast worden)
            notes: null
        }));

        // 3. Upsert in database (update als identifier + catalogId al bestaat)
        const upsertPromises = importData.map(data =>
            prisma.dataset.upsert({
                where: {
                    catalogId_identifier: {
                        catalogId: data.catalogId,
                        identifier: data.identifier
                    }
                },
                create: data,
                update: {
                    title: data.title,
                    description: data.description,
                    modified: data.modified,
                    theme: data.theme,
                    accessUrl: data.accessUrl,
                    // ... voeg hier andere velden toe die je wilt bijwerken bij sync
                }
            })
        );

        await Promise.all(upsertPromises);
        return importData.length;
    },

    /**
     * Haalt alle datasets op die gekoppeld zijn aan een specifieke catalogus.
     */
    getByCatalogId: (catalogId: string): Promise<Dataset[]> =>
        prisma.dataset.findMany({
            where: {catalogId},
            include: {
                catalog: true
            },
            orderBy: {title: 'asc'}
        }),

    /**
     * Haalt één dataset op via catalogus + identifier.
     */
    getByCatalogAndIdentifier: (
        catalogId: string,
        identifier: string
    ): Promise<Dataset | null> =>
        prisma.dataset.findUnique({
            where: {
                catalogId_identifier: {catalogId, identifier}
            }
        }),

    /**
     * Update publicatie-instellingen van een dataset (bijv. via UI).
     */
    updatePublishSettings: (
        id: string,
        data: UpdatePublishSettings
    ): Promise<Dataset> =>
        prisma.dataset.update({
            where: {id},
            data: {
                ...data,
                publishedAt:
                    data.isPublished === true
                        ? new Date() // zet publishedAt alleen bij eerste publicatie
                        : undefined
            }
        }),

    /**
     * Haalt alle datasets op die GEPUBLICEERD zijn (voor DCAT-AP feed).
     */
    getPublishedDatasets: (): Promise<Dataset[]> =>
        prisma.dataset.findMany({
            where: {isPublished: true},
            include: {catalog: true} // inclusief catalog info voor publisher
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
