import {Guard} from "$lib/server/helpers/guard.helper";
import {CatalogRepository} from "$lib/server/repositories/catalog.repository";
import {form} from "$lib/server/helpers/form.helper";
import {type Actions, fail, redirect} from "@sveltejs/kit";
import {titleToName} from "$lib/server/helpers/string.helper";

export const load = Guard.load(async ({ locals, params: { catalog_id } }) => {
    // Haal de catalogusgegevens op uit de database
    const catalog = await CatalogRepository.getById(catalog_id);

    if (!catalog) {
        // Afhankelijk van jouw voorkeur, bijv. redirect of throw error
        // redirect(303, '/catalogs');
        throw new Error(`Catalog with id ${catalog_id} not found.`); // Dit resulteert in een 500-foutpagina
        // Of gebruik fail(404, ...) in combinatie met een try-catch en een specifieke foutpagina
    }

    // Haal de datasets op vanuit de externe catalogus via de repository (gebruikt de juiste adapter intern)

    return {
        catalog: { ...catalog, datasets: CatalogRepository.getDatasetsFromCatalog(catalog_id) } // Voeg de opgehaalde DCAT-AP datasets toe aan de catalogusdata
    };
});

export const actions: Actions = {
    updateCatalog: Guard.action(async (event) => {
        const { guard: { form }, params: {catalog_id} } = event;

        if (!catalog_id) {
            return fail(400, { message: "Catalog ID is required." });
        }

        // Haal de bestaande catalogus op om de oorspronkelijke 'name' te kunnen vergelijken
        const existingCatalog = await CatalogRepository.getById(catalog_id);
        if (!existingCatalog) {
            return fail(404, { message: "Catalog not found." });
        }

        const title = form.string$('catalog.title');
        const newName = titleToName(title); // Genereer nieuwe 'name' op basis van de bijgewerkte titel
        const description = form.string$('catalog.description');
        const apiStandard = form.string$('catalog.apiStandard');
        const apiUrl = form.string$('catalog.apiUrl');
        const apiKey = form.string('catalog.apiKey');
        const isActive = form.boolean$('catalog.isActive');

        // Validatie (optioneel)
        const allowedApiStandards = [
            'opendatasoft_explore_v2',
            'ckan_api_v3',
            'socrata',
            'arcgis_rest',
            'datagouvfr',
            'geonetwork',
            'fme',
            'azure_open_data',
            'google_bigquery',
            'aws_data_exchange'
        ];

        if (!allowedApiStandards.includes(apiStandard)) {
            return fail(400, { message: "Invalid API standard." });
        }

        // Controleer of de nieuwe 'name' uniek is, maar niet conflicteert met de huidige catalogus zelf
        if (newName !== existingCatalog.name) { // Alleen checken als de naam daadwerkelijk verandert
            const conflictingCatalog = await CatalogRepository.getByName(newName);
            if (conflictingCatalog && conflictingCatalog.id !== catalog_id) { // Controleer of het conflicterende item een ANDERE catalogus is
                return fail(409, {
                    message: `A catalog with a similar title (resulting in name '${newName}') already exists. Please choose a different title.`
                });
            }
        }

        // Update de catalogus in de database
        const updatedCatalog = await CatalogRepository.update(catalog_id, {
            name: newName, // Gebruik de nieuwe gegenereerde naam
            title,
            description,
            apiStandard,
            apiUrl,
            apiKey,
            isActive
        });

        // Redirect naar de detailpagina van de bijgewerkte catalogus of naar het overzicht
        redirect(303, `/catalogs/${updatedCatalog.id}`); // Of naar '/catalogs' voor het overzicht

    }, form.guard)
};
