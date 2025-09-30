import { fail, redirect } from '@sveltejs/kit';
import { Guard } from '$lib/server/helpers/guard.helper';
import { CatalogRepository } from '$lib/server/repositories/catalog.repository';
import { form } from '$lib/server/helpers/form.helper';
import type { Actions, PageServerLoad } from './$types';
import {titleToName} from "$lib/server/helpers/string.helper";

export const load: PageServerLoad = async (event) => {
    // Optioneel: haal bestaande catalogussen op om te tonen
    const catalogs = await CatalogRepository.getAll();
    return { catalogs };
};

export const actions: Actions = {
    addCatalog: Guard.action(async (event) => {
        const { guard: { form } } = event;

        const title = form.string$('catalog.title');
        const nameFromTitle = titleToName(title);
        const description = form.string$('catalog.description');
        const apiStandard = form.string$('catalog.apiStandard');
        const apiUrl = form.string$('catalog.apiUrl');
        const apiKey = form.string$('catalog.apiKey', true);
        const isActive = form.boolean$('catalog.isActive', true);

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

        // Controleer of een catalogus met deze gegenereerde 'name' al bestaat
        const existingCatalog = await CatalogRepository.getByName(nameFromTitle);
        if (existingCatalog) {
            // Als deze bestaat, geef een foutmelding terug
            return fail(409, {
                message: `A catalog with a similar title (resulting in name '${nameFromTitle}') already exists. Please choose a different title.`
            });
        }

        // Als de naam uniek is, voeg de catalogus toe
        const newCatalog = await CatalogRepository.create({
            name: nameFromTitle,
            title,
            description,
            apiStandard,
            apiUrl,
            apiKey,
            isActive
        });

        // Redirect na succesvolle creatie
        redirect(303, '/catalogs');

    }, form.guard)
};
