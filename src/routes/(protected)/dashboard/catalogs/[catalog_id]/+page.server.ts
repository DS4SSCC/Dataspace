import {Guard} from "$lib/server/helpers/guard.helper";
import {CatalogRepository} from "$lib/server/repositories/catalog.repository";
import {form} from "$lib/server/helpers/form.helper";
import {type Actions, fail, redirect} from "@sveltejs/kit";
import {titleToName} from "$lib/server/helpers/string.helper";
import {DatasetRepository} from "$lib/server/repositories/dataset.repository";

export const load = Guard.load(async ({ locals, params: { catalog_id } }) => {
    const catalog = await CatalogRepository.getById(catalog_id);
    if (!catalog) {
        throw new Error(`Catalog with id ${catalog_id} not found.`);
    }

    // Fetch external datasets (Promise)
    const externalDatasetsPromise = CatalogRepository.getDatasetsFromCatalog(catalog_id);

    // Fetch locally imported datasets (already resolved)
    const localDatasets = await DatasetRepository.getByCatalogId(catalog_id);

    return {
        catalog: {
            ...catalog,
            datasets: externalDatasetsPromise // keep as Promise for {#await}
        },
        localDatasets // resolved array
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
        const name = titleToName(title); // Genereer nieuwe 'name' op basis van de bijgewerkte titel
        const description = form.string$('catalog.description');
        const api_standard = form.string$('catalog.apiStandard');
        const api_url = form.string$('catalog.apiUrl');
        const api_key = form.string('catalog.apiKey');
        const is_active = form.boolean$('catalog.isActive');

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

        if (!allowedApiStandards.includes(api_standard)) {
            return fail(400, { message: "Invalid API standard." });
        }

        // Controleer of de nieuwe 'name' uniek is, maar niet conflicteert met de huidige catalogus zelf
        if (name !== existingCatalog.name) { // Alleen checken als de naam daadwerkelijk verandert
            const conflictingCatalog = await CatalogRepository.getByName(name);
            if (conflictingCatalog && conflictingCatalog.id !== catalog_id) { // Controleer of het conflicterende item een ANDERE catalogus is
                return fail(409, {
                    message: `A catalog with a similar title (resulting in name '${name}') already exists. Please choose a different title.`
                });
            }
        }

        // Update de catalogus in de database
        const updatedCatalog = await CatalogRepository.update(catalog_id, {
            name, // Gebruik de nieuwe gegenereerde naam
            title,
            description,
            api_standard,
            api_url,
            api_key,
            is_active
        });

        // Redirect naar de detailpagina van de bijgewerkte catalogus of naar het overzicht
        redirect(303, `/dashboard/catalogs/${updatedCatalog.id}`); // Of naar '/catalogs' voor het overzicht

    }, form.guard),
    deleteCatalog: Guard.action(async ({ params }) => {
        const { catalog_id } = params;

        if (!catalog_id) {
            return fail(400, { message: 'Catalog ID is required' });
        }

        // Retrieve catalog to check if it exists before deleting
        const existingCatalog = await CatalogRepository.getById(catalog_id);
        if (!existingCatalog) {
            return fail(404, { message: 'Catalog not found' });
        }

        // --- CRITICAL STEP: Delete associated datasets first ---
        // Use the DatasetRepository function you created to delete all datasets linked to this catalog ID
        try {
            await DatasetRepository.deleteByCatalogId(catalog_id);
            console.log(`Deleted datasets associated with catalog ID: ${catalog_id}`);
        } catch (datasetDeleteErr) {
            console.error('Error deleting datasets for catalog:', catalog_id, datasetDeleteErr);
            // Depending on your error handling strategy, you might fail here or proceed.
            // Failing here prevents orphaned datasets but stops the catalog deletion if the dataset deletion fails.
            // For robustness, you might want to log and potentially alert, but allow catalog deletion to proceed.
            // However, for data integrity, it's often better to fail if dependencies cannot be removed.
            // Let's fail for now to ensure data integrity.
            return fail(500, { message: 'Failed to delete associated datasets. Catalog deletion aborted.' });
        }

        // Perform the catalog deletion using the repository
        try {
            await CatalogRepository.deleteById(catalog_id);
        } catch (err) {
            console.error('Error deleting catalog:', err);
            return fail(500, { message: 'Failed to delete catalog' });
        }

        // Redirect to the main catalogs list page after successful deletion
        redirect(303, '/dashboard/catalogs');
    }, form.guard), // Assuming you use a form guard helper
    importDataset: Guard.action(async (event) => {
        const { guard: { form }, params: { catalog_id } } = event;

        if (!catalog_id) {
            return fail(400, { message: "Catalog ID is required." });
        }

        const dataset_identifier = form.string$('dataset.identifier');
        const is_published = form.boolean('dataset.isPublished') ?? false;
        const policy_intent = form.string('dataset.policyIntent') ?? 'PUBLIC';

        // Optional: validate policyIntent
        const validPolicies = ['PUBLIC', 'RESTRICTED', 'INTERNAL'];
        if (!validPolicies.includes(policy_intent)) {
            return fail(400, { message: "Invalid policy intent." });
        }

        // Get catalog to ensure it exists and get its internal ID
        const catalog = await CatalogRepository.getById(catalog_id);
        if (!catalog) {
            return fail(404, { message: "Catalog not found." });
        }

        // Fetch the full dataset metadata from the external source (via adapter)
        const dcatDatasets = await CatalogRepository.getDatasetsFromCatalog(catalog_id);
        const selectedDataset = dcatDatasets.find(ds => ds.id === dataset_identifier);

        if (!selectedDataset) {
            return fail(404, { message: "Dataset not found in catalog." });
        }

        // Map to Prisma-compatible data
        const datasetData = {
            catalog_id: catalog.id,
            title: selectedDataset.title,
            description: selectedDataset.description || '',
            identifier: selectedDataset.id,
            issued: selectedDataset.issued ? new Date(selectedDataset.issued) : null,
            modified: selectedDataset.modified ? new Date(selectedDataset.modified) : null,
            language: null, // extend if your adapter provides it
            theme: selectedDataset.themes?.[0] || null,
            spatial: null,
            temporal_start: null,
            temporal_end: null,
            license: selectedDataset.license?.id || null,
            access_rights: null, // or map from accessRights.id
            access_url: selectedDataset.distributions?.find(d => d.accessUrl)?.accessUrl || null,
            download_url: selectedDataset.distributions?.find(d => d.downloadUrl)?.downloadUrl || null,
            media_type: selectedDataset.distributions?.[0]?.mediaType || null,
            is_published,
            policy_intent: policy_intent as any, // Prisma enum
            notes: null
        };

        try {
            await DatasetRepository.create(datasetData);
        } catch (err) {
            console.error("Import failed:", err);
            return fail(500, { message: "Failed to import dataset." });
        }

        // Return success (modal will close on client)
        return { success: true };
    }, form.guard),
};
