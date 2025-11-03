export interface Dataset {
    id: string;
    title: string;
    modified: string; // ISO 8601
}

export interface Subscriber {
    inboxUrl: string;
    name: string;
}
