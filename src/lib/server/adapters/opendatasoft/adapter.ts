import type {
    DcatApDataset,
    OdsDataset,
    OdsDatasetResponse,
    OdsRecordsResponse,
    OdsRecord,
    DcatApDistribution
} from './types';

export interface DataPortalAdapter {
    convertToDcatAp(data: unknown): DcatApDataset[];
}

export class OpenDataSoftAdapter implements DataPortalAdapter {
    private readonly baseUrl: string;
    private readonly apiKey?: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = apiKey;
    }

    async getDatasets(limit = 100, offset = 0): Promise<OdsDataset[]> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });

        if (this.apiKey) params.append('apikey', this.apiKey);

        const response = await fetch(
            `${this.baseUrl}/api/explore/v2.1/catalog/datasets?${params}`
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data: OdsDatasetResponse = await response.json();
        return data.results;
    }

    async getDataset(datasetId: string): Promise<OdsDataset> {
        const params = new URLSearchParams();
        if (this.apiKey) params.append('apikey', this.apiKey);

        const response = await fetch(
            `${this.baseUrl}/api/explore/v2.1/catalog/datasets/${encodeURIComponent(datasetId)}?${params}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch dataset: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async getRecords(datasetId: string, limit = 100, offset = 0): Promise<OdsRecord[]> {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        });

        if (this.apiKey) params.append('apikey', this.apiKey);

        const response = await fetch(
            `${this.baseUrl}/api/explore/v2.1/catalog/datasets/${encodeURIComponent(datasetId)}/records?${params}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch records: ${response.status} ${response.statusText}`);
        }

        const data: OdsRecordsResponse = await response.json();
        return data.results;
    }

    convertToDcatAp(data: unknown): DcatApDataset[] {
        if (!data) return [];

        let datasets: OdsDataset[];
        if (Array.isArray(data)) {
            datasets = data;
        } else if ((data as OdsDatasetResponse).results) {
            datasets = (data as OdsDatasetResponse).results;
        } else if ((data as OdsDataset).dataset_id) {
            datasets = [data as OdsDataset];
        } else {
            return [];
        }

        return datasets.map(odsDataset => {
            const meta = odsDataset.metas.default;
            return {
                id: odsDataset.dataset_uid,
                title: meta.title || 'Untitled Dataset',
                description: meta.description || '',
                issued: meta.modified ? this.normalizeDate(meta.modified) : undefined,
                modified: meta.modified ? this.normalizeDate(meta.modified) : undefined,
                publisher: {
                    id: meta.publisher || 'unknown',
                    name: meta.publisher || 'Unknown Publisher'
                },
                themes: meta.theme?.map(t => `http://example.org/theme/${encodeURIComponent(t)}`) || [],
                keywords: meta.keyword || [],
                landingPage: `${this.baseUrl}/explore/dataset/${odsDataset.dataset_id}/`,
                distributions: [
                    // API endpoint distribution
                    {
                        id: `${odsDataset.dataset_uid}-api`,
                        title: 'API Endpoint',
                        description: 'REST API endpoint for this dataset',
                        accessUrl: `${this.baseUrl}/api/explore/v2.1/catalog/datasets/${odsDataset.dataset_id}/`,
                        mediaType: 'application/json',
                        format: 'API'
                    },
                    // Export distributions
                    ...this.createExportDistributions(odsDataset),
                    // Attachment distributions
                    ...odsDataset.attachments.map(att => ({
                        id: `${odsDataset.dataset_uid}-${att.id}`,
                        title: att.title,
                        description: `Attachment: ${att.title}`,
                        accessUrl: att.url,
                        downloadUrl: att.url,
                        mediaType: att.mimetype,
                        format: this.mimeTypeToFormat(att.mimetype)
                    }))
                ]
            };
        });
    }

    private createExportDistributions(dataset: OdsDataset): DcatApDistribution[] {
        const formats = ['csv', 'json', 'geojson', 'xlsx', 'parquet'];
        return formats.map(format => ({
            id: `${dataset.dataset_uid}-export-${format}`,
            title: `${format.toUpperCase()} Export`,
            description: `Download dataset in ${format.toUpperCase()} format`,
            accessUrl: `${this.baseUrl}/api/explore/v2.1/catalog/datasets/${dataset.dataset_id}/exports/${format}`,
            downloadUrl: `${this.baseUrl}/api/explore/v2.1/catalog/datasets/${dataset.dataset_id}/exports/${format}`,
            mediaType: this.formatToMediaType(format),
            format: format.toUpperCase()
        }));
    }

    private formatToMediaType(format: string): string {
        const map: Record<string, string> = {
            csv: 'text/csv',
            json: 'application/json',
            geojson: 'application/geo+json',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            parquet: 'application/vnd.apache.parquet'
        };
        return map[format] || 'application/octet-stream';
    }

    private mimeTypeToFormat(mimeType: string): string {
        const map: Record<string, string> = {
            'text/csv': 'CSV',
            'application/json': 'JSON',
            'application/geo+json': 'GeoJSON',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
            'application/vnd.apache.parquet': 'PARQUET'
        };
        return map[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN';
    }

    private normalizeDate(dateStr: string): string {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }
}
