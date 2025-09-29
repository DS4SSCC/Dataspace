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

// CKAN-specific types
export interface CkanDataset {
    id: string;
    name: string;
    title: string;
    notes: string;
    metadata_created: string; // ISO 8601
    metadata_modified: string; // ISO 8601
    organization?: CkanOrganization;
    tags?: CkanTag[];
    groups?: CkanGroup[];
    resources: CkanResource[];
    extras?: CkanExtra[];
}

export interface CkanOrganization {
    id: string;
    name: string;
    title: string;
}

export interface CkanTag {
    id: string;
    name: string;
    display_name?: string;
}

export interface CkanGroup {
    id: string;
    name: string;
    title: string;
}

export interface CkanResource {
    id: string;
    name: string;
    description: string;
    url: string;
    format: string;
    mimetype?: string;
    created?: string; // ISO 8601
    last_modified?: string; // ISO 8601
    size?: number;
    resource_type?: string;
    package_id?: string;
}

export interface CkanExtra {
    key: string;
    value: unknown;
}

export interface CkanDatasetResponse {
    success: boolean;
    result: {
        count: number;
        results: string[]; // CKAN API v3 returns array of dataset IDs here
    };
}

export interface CkanDatasetShowResponse {
    success: boolean;
    result: CkanDataset;
}

export interface CkanResourceResponse {
    success: boolean;
    result: CkanResource[];
}
