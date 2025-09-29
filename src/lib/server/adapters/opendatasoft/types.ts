// Standardized DCAT-AP types
export interface DcatApDataset {
    id: string;
    title: string;
    description: string;
    issued?: string; // ISO 8601 date
    modified?: string; // ISO 8601 date
    publisher: {
        id: string;
        name: string;
    };
    themes: string[]; // URIs
    keywords: string[];
    distributions: DcatApDistribution[];
    landingPage?: string;
    contactPoint?: string;
}

export interface DcatApDistribution {
    id: string;
    title: string;
    description: string;
    accessUrl: string;
    downloadUrl?: string;
    mediaType: string; // IANA media type
    format?: string; // Dublin Core format
    byteSize?: number;
}

// OpenDataSoft-specific types
export interface OdsDataset {
    dataset_id: string;
    dataset_uid: string;
    attachments: OdsAttachment[];
    has_records: boolean;
    data_visible: boolean;
    metas: {
        default: OdsMetadata;
    };
    fields: OdsField[];
    features: string[];
}

export interface OdsMetadata {
    title: string;
    description: string;
    modified: string; // ISO 8601
    publisher: string;
    theme: string[];
    keyword: string[];
    license?: string;
    license_url?: string;
    records_count?: number;
    attributions?: string[];
}

export interface OdsField {
    name: string;
    label: string;
    type: string;
    description?: string;
    annotations: Record<string, unknown>;
}

export interface OdsAttachment {
    mimetype: string;
    url: string;
    id: string;
    title: string;
}

export interface OdsDatasetResponse {
    total_count: number;
    results: OdsDataset[];
}

export interface OdsRecord {
    [key: string]: unknown;
    _id: string;
    _timestamp: string;
    _links: { href: string; rel: string }[];
}

export interface OdsRecordsResponse {
    total_count: number;
    results: OdsRecord[];
}
