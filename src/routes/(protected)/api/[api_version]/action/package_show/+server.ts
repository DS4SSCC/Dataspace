import { PrismaClient } from '@prisma/client';
import type {RequestHandler} from "@sveltejs/kit";

const prisma = new PrismaClient();

// Helper: map license URI to CKAN license_id
function mapLicenseToCkanId(licenseUri: string | null): string {
    if (!licenseUri) return 'notspecified';
    if (licenseUri.includes('creativecommons.org/licenses/by/4.0')) return 'cc-by';
    if (licenseUri.includes('creativecommons.org/publicdomain/zero')) return 'cc-zero';
    // Add more as needed
    return 'other-open';
}

export const GET: RequestHandler = async ({ url }) => {
    const id = url.searchParams.get('id');
    if (!id) {
        return new Response(
            JSON.stringify({
                success: false,
                error: { __type: 'Validation Error', message: 'Missing "id" parameter' }
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Try to find by id, identifier, or slug (if you add slug later)
    const dataset = await prisma.dataset.findFirst({
        where: {
            OR: [
                { id: { equals: id } },
                { identifier: { equals: id } },
                // { slug: { equals: id } }  // enable if you add slug
            ]
        },
        include: { catalog: true }
    });

    if (!dataset) {
        return new Response(
            JSON.stringify({
                success: false,
                error: { __type: 'Not Found Error', message: 'Dataset not found' }
            }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Build CKAN resources
    const resources = [];
    if (dataset.access_url) {
        resources.push({
            id: `${dataset.id}-access`,
            url: dataset.access_url,
            format: dataset.media_type || 'API',
            name: 'Access endpoint'
        });
    }
    if (dataset.download_url) {
        resources.push({
            id: `${dataset.id}-download`,
            url: dataset.download_url,
            format: dataset.media_type || 'Unknown',
            name: 'Download'
        });
    }

    const ckanPackage = {
        id: dataset.id,
        name: dataset.identifier.replace(/[^a-z0-9_-]/g, '_').toLowerCase(), // fallback slug
        title: dataset.title,
        notes: dataset.description || '',
        metadata_created: dataset.imported_at.toISOString(),
        metadata_modified: (dataset.modified || dataset.imported_at).toISOString(),
        license_id: mapLicenseToCkanId(dataset.license),
        organization: {
            id: dataset.catalog.id,
            name: dataset.catalog.name,
            title: dataset.catalog.title,
            description: dataset.catalog.description || ''
        },
        resources,
        tags: dataset.theme
            ? [{ name: dataset.theme.split('/').pop()?.replace(/[^a-z0-9]/gi, '')?.toLowerCase() || 'theme' }]
            : [],
        isopen: dataset.policy_intent === 'PUBLIC'
    };

    return new Response(
        JSON.stringify({ success: true, result: ckanPackage }),
        { headers: { 'Content-Type': 'application/json' } }
    );
};
