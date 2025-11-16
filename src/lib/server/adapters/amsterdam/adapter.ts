import type {
    DcatApDataset,
    AmsterdamDataset,
    AmsterdamDatasetResponse,
    AmsterdamResource
} from './types';

export interface DataPortalAdapter {
    convertToDcatAp(data: AmsterdamDataset | AmsterdamDataset[]): DcatApDataset[];
}

export class AmsterdamAdapter implements DataPortalAdapter {
    private readonly baseUrl: string;
    private readonly apiKey?: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
    }

    private async makeRequest(path: string, params?: Record<string, string>): Promise<unknown> {
        const url = new URL(`${this.baseUrl}${path}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['X-Api-Key'] = this.apiKey; // Volgens Amsterdam API documentatie
        }

        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }

    async getDatasets(limit = 100, offset = 0): Promise<AmsterdamDataset[]> {
        // De exacte endpoint voor datasets is niet duidelijk uit de docs, maar vaak is het iets als:
        const endpoint = '/datasets/'; // Of een andere path; pas aan indien nodig

        // Voorbeeld van een response object, pas aan aan echte API
        const data = await this.makeRequest(endpoint, {
            _limit: limit.toString(),
            _offset: offset.toString(),
        }) as AmsterdamDatasetResponse;

        // Veronderstel dat de API een array van datasets teruggeeft
        if (Array.isArray(data)) {
            return data;
        }

        // Of als het een object is met een resultaatveld, bijvoorbeeld:
        // return data.results || data.datasets || [];
        throw new Error('Unexpected API response structure');
    }

    async getDataset(datasetId: string): Promise<AmsterdamDataset> {
        const endpoint = `/datasets/${datasetId}/`;
        const data = await this.makeRequest(endpoint) as AmsterdamDataset;
        return data;
    }

    convertToDcatAp(data: AmsterdamDataset | AmsterdamDataset[]): DcatApDataset[] {
        if (!data) return [];

        const datasets = Array.isArray(data) ? data : [data];

        return datasets.map(amsDataset => ({
            id: amsDataset.id || amsDataset._links?.self?.href || 'unknown',
            title: amsDataset.title || 'Untitled Dataset',
            description: amsDataset.description || '',
            issued: this.normalizeDate(amsDataset.created || amsDataset.issued),
            modified: this.normalizeDate(amsDataset.last_modified || amsDataset.modified),
            publisher: {
                id: 'Amsterdam',
                name: 'Gemeente Amsterdam'
            },
            themes: amsDataset.themes || [],
            keywords: amsDataset.keywords || [],
            landingPage: amsDataset._links?.self?.href || undefined,
            distributions: (amsDataset.resources || []).map(res => ({
                id: res.id || res.url,
                title: res.title || 'Untitled Resource',
                description: res.description || '',
                accessUrl: res.url,
                downloadUrl: res.url, // Aannames, pas aan indien nodig
                mediaType: res.media_type || this.formatToMediaType(res.format),
                format: res.format,
                byteSize: res.byte_size
            }))
        }));
    }

    private normalizeDate(dateStr?: string): string {
        if (!dateStr) return new Date().toISOString();
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
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
