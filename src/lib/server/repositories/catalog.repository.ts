import { prisma } from '$lib/server/configurations/prisma.config';
import type { Catalog } from '@prisma/client';
import {OpenDataSoftAdapter} from "$lib/server/adapters/opendatasoft";
import {CkanAdapter, type DcatApDataset} from "$lib/server/adapters/ckan"; // Zorg ervoor dat dit type beschikbaar is

export const CatalogRepository = {
    /**
     * Maakt een nieuwe catalogus aan in de database.
     * @param data - De gegevens voor de nieuwe catalogus.
     * @returns De aangemaakte Catalog record.
     */
    create: (data: any): Promise<Catalog> =>
        prisma.catalog.create({
            data
        }),

    /**
     * Haalt een catalogus op aan de hand van de unieke naam.
     * @param name - De unieke naam van de catalogus.
     * @returns De gevonden Catalog record of null als deze niet bestaat.
     */
    getByName: (name: string): Promise<Catalog | null> =>
        prisma.catalog.findUnique({
            where: {
                name // Gebruik het 'name' veld als unieke sleutel
            }
        }),

    /**
     * Haalt een catalogus op aan de hand van het interne id.
     * @param id - Het id van de catalogus.
     * @returns De gevonden Catalog record of null als deze niet bestaat.
     */
    getById: (id: string): Promise<Catalog | null> =>
        prisma.catalog.findUnique({
            where: {
                id // Gebruik het 'id' veld als unieke sleutel
            }
        }),

    /**
     * Haalt alle catalogi op uit de database.
     * @returns Een array van Catalog records.
     */
    getAll: (): Promise<Catalog[]> =>
        prisma.catalog.findMany({}),

    /**
     * Update een bestaande catalogus.
     * @param id - Het id van de catalogus om te updaten.
     * @param data - De gegevens om bij te werken.
     * @returns De bijgewerkte Catalog record.
     */
    update: (id: string, data: any): Promise<Catalog> =>
        prisma.catalog.update({
            where: {
                id
            },
            data
        }),

    /**
     * Verwijdert een catalogus aan de hand van de unieke naam.
     * @param name - De unieke naam van de catalogus om te verwijderen.
     * @returns De verwijderde Catalog record.
     */
    deleteByName: (name: string): Promise<Catalog> =>
        prisma.catalog.delete({
            where: {
                name
            }
        }),

    /**
     * Verwijdert een catalogus aan de hand van het interne id.
     * @param id - Het id van de catalogus om te verwijderen.
     * @returns De verwijderde Catalog record.
     */
    deleteById: (id: string): Promise<Catalog> =>
        prisma.catalog.delete({
            where: {
                id
            }
        }),
    /**
     * Haalt de datasets op vanuit een externe catalogus via de juiste adapter
     * en converteert deze naar DCAT-AP formaat.
     * @param catalogId - Het id van de catalogus in de lokale database.
     * @returns Een array van DcatApDataset objecten.
     */
    async getDatasetsFromCatalog(catalogId: string): Promise<DcatApDataset[]> {
        // 1. Haal de catalogus op uit de database
        const catalog = await prisma.catalog.findUnique({
            where: {
                id: catalogId
            }
        });

        if (!catalog) {
            throw new Error(`Catalog with id ${catalogId} not found.`);
        }

        // 2. Kies de juiste adapter op basis van apiStandard
        let adapter;
        switch (catalog.api_standard) {
            case 'opendatasoft_explore_v2':
                adapter = new OpenDataSoftAdapter(catalog.api_url, catalog.api_key ?? undefined);
                break;
            case 'ckan_api_v3':
                adapter = new CkanAdapter(catalog.api_url, catalog.api_key ?? undefined);
                break;
            default:
                throw new Error(`Unsupported API standard: ${catalog.api_standard}`);
        }

        // 3. Gebruik de adapter om datasets op te halen en te converteren
        try {
            // De specifieke methode om datasets op te halen kan per adapter verschillen
            // Bijv. getDatasets() voor zowel ODS als CKAN (aangepast indien nodig)
            // Dit voorbeeld gebruikt de methode zoals gedefinieerd in de adapters
            let rawData;
            if (catalog.api_standard === 'opendatasoft_explore_v2') {
                rawData = await (adapter as OpenDataSoftAdapter).getDatasets(); // Type assertie voor specifieke methode
            } else if (catalog.api_standard === 'ckan_api_v3') {
                rawData = await (adapter as CkanAdapter).getDatasets(); // Type assertie voor specifieke methode
            }

            // Roep de standaard conversie methode aan van de adapter
            const dcatApDatasets = adapter.convertToDcatAp(rawData);

            // Optioneel: update de lastSync datum in de database
            await prisma.catalog.update({
                where: { id: catalogId },
                data: { last_sync: new Date() }
            });

            return dcatApDatasets;
        } catch (err) {
            console.error(`Error fetching or converting datasets for catalog ${catalogId}:`, err);
            throw new Error(`Failed to fetch or convert datasets for catalog ${catalogId}.`);
        }
    },
};
