import type {
    DcatApDataset,
    CkanDataset,
    CkanDatasetResponse,
    CkanDatasetShowResponse,
    CkanResource,
    CkanOrganization,
    CkanTag,
    CkanGroup, CkanResourceResponse
} from './types';

export interface DataPortalAdapter {
    convertToDcatAp(data: CkanDataset | CkanDataset[] | CkanDatasetResponse): DcatApDataset[];
}

export class CkanAdapter implements DataPortalAdapter {
    private readonly baseUrl: string;
    private readonly apiKey?: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = apiKey;
    }

    private async makeRequest(endpoint: string, params?: Record<string, string>): Promise<unknown> {
        const url = new URL(`${this.baseUrl}/api/3/action/${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.apiKey) headers['Authorization'] = this.apiKey;

        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    async getDatasets(limit = 100, offset = 0): Promise<CkanDataset[]> {
        const data = await this.makeRequest('package_list', { limit: limit.toString(), offset: offset.toString() }) as CkanDatasetResponse;

        if (!data.success) {
            throw new Error('Failed to retrieve dataset list');
        }

        // Fetch detailed info for each dataset
        const detailedDatasets = await Promise.all(
            data.result.map(async (datasetId: string) => {
                return await this.getDataset(datasetId);
            })
        );

        return detailedDatasets;
    }

    async getDataset(datasetId: string): Promise<CkanDataset> {
        const data = await this.makeRequest('package_show', { id: datasetId }) as CkanDatasetShowResponse;

        if (!data.success) {
            throw new Error(`Failed to retrieve dataset: ${datasetId}`);
        }

        return data.result;
    }

    async getDatasetResources(datasetId: string): Promise<CkanResource[]> {
        const data = await this.makeRequest('resource_list', { id: datasetId });
        const result = data as CkanResourceResponse;

        if (!result.success) {
            throw new Error(`Failed to retrieve resources for dataset: ${datasetId}`);
        }

        return result.result;
    }

    convertToDcatAp(data: CkanDataset | CkanDataset[] | CkanDatasetResponse): DcatApDataset[] {
        if (!data) return [];

        let datasets: CkanDataset[];
        if (Array.isArray(data)) {
            datasets = data;
        } else if ((data as CkanDatasetResponse).result?.results) {
            // Handle response from getDatasets (list of IDs) - need to fetch details separately
            console.warn("Input appears to be a list response from package_list. This requires fetching individual dataset details.");
            // This path is not fully handled by convertToDcatAp directly, as it needs individual dataset details
            // Typically, convertToDcatAp is called after detailed datasets are fetched
            return [];
        } else if ((data as CkanDataset).id) {
            datasets = [data as CkanDataset];
        } else {
            return [];
        }

        return datasets.map(ckanDataset => ({
            id: ckanDataset.id,
            title: ckanDataset.title || 'Untitled Dataset',
            description: ckanDataset.notes || '',
            issued: this.normalizeDate(ckanDataset.metadata_created),
            modified: this.normalizeDate(ckanDataset.metadata_modified),
            publisher: this.normalizePublisher(ckanDataset.organization),
            themes: ckanDataset.groups?.map(g => this.createThemeUri(g)) || [],
            keywords: ckanDataset.tags?.map(t => t.name) || [],
            landingPage: `${this.baseUrl}/dataset/${ckanDataset.name}`,
            distributions: ckanDataset.resources.map(res => ({
                id: res.id,
                title: res.name || 'Untitled Resource',
                description: res.description || '',
                accessUrl: res.url,
                downloadUrl: res.url, // CKAN resources are typically direct downloads
                mediaType: res.mimetype || this.formatToMediaType(res.format),
                format: res.format,
                byteSize: res.size
            }))
        }));
    }

    private normalizeDate(dateStr: string): string {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }

    private normalizePublisher(org?: CkanOrganization): DcatApDataset['publisher'] {
        if (!org) {
            return { id: 'unknown', name: 'Unknown Publisher' };
        }
        return {
            id: org.id || org.name,
            name: org.title || org.name || 'Unknown Publisher'
        };
    }

    private createThemeUri(group: CkanGroup): string {
        // Create a URI for the theme based on the group
        return `http://example.org/theme/${encodeURIComponent(group.name)}`;
    }

    private formatToMediaType(format: string): string {
        const formatLower = format.toLowerCase();
        const map: Record<string, string> = {
            csv: 'text/csv',
            json: 'application/json',
            xml: 'application/xml',
            geojson: 'application/geo+json',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            zip: 'application/zip',
            pdf: 'application/pdf',
            txt: 'text/plain',
            html: 'text/html'
        };
        return map[formatLower] || 'application/octet-stream';
    }
}
