// Hergebruik van DCAT-AP types (kan exporteren uit een gedeelde map)
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

// Amsterdam-specifieke types
export interface AmsterdamDataset {
    id: string;
    title: string;
    description: string;
    created?: string; // ISO 8601
    last_modified?: string; // ISO 8601
    issued?: string; // ISO 8601
    modified?: string; // ISO 8601
    themes?: string[];
    keywords?: string[];
    resources?: AmsterdamResource[];
    _links?: {
        self?: { href: string };
        [key: string]: { href: string } | undefined;
    };
}

export interface AmsterdamResource {
    id: string;
    title: string;
    description: string;
    url: string;
    format?: string;
    media_type?: string;
    byte_size?: number;
}

export interface AmsterdamDatasetResponse {
    // Aanpassen aan echte API response
    // Bijvoorbeeld:
    // count: number;
    // results: AmsterdamDataset[];
    // Of gewoon een array:
    [index: number]: AmsterdamDataset;
}
