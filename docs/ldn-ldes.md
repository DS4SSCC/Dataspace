# LDN and LDES Mechanism

This document describes how Linked Data Notifications (LDN) and Linked Data Event Streams (LDES) are implemented in this project.

## Concepts

- LDN is used to push change notifications to external applications via their inbox URLs.
- LDES is used to store immutable change events (publish/update) as a stream of dataset snapshots.

## Data Models

### LDNNotification

Stored for every delivery attempt.

Key fields:
- `dataset_id` (string, FK -> Dataset)
- `content` (JSON) — the LDN payload
- `type` (string) — e.g. `Published`, `Updated`
- `delivered` (boolean)
- `created_at` (datetime)
- `delivered_at` (datetime, nullable)
- `ldes_event_id` (string, nullable)

### LDESEvent

Represents a single event in the dataset’s event stream.

Key fields:
- `dataset_id` (string, FK -> Dataset)
- `event_type` (string) — `DatasetPublished` or `DatasetUpdated`
- `event_data` (JSON) — JSON-LD snapshot of the dataset
- `timestamp` (datetime)
- `version_of` (string, nullable)
- `previous` (string, nullable)

## Where Events and Notifications Are Created

### Publish via catalog import

When a dataset is imported and marked as published:
- An LDES event is created (`DatasetPublished`) with DCAT JSON-LD data.
- An LDN notification is broadcast to all active applications with an inbox URL.

Code: `src/routes/(protected)/dashboard/catalogs/[catalog_id]/+page.server.ts`

### Update a dataset

When a published dataset is updated:
- An LDES event is created (`DatasetUpdated`) with updated DCAT JSON-LD data.
- An LDN notification is broadcast to all active applications with an inbox URL.

Code: `src/routes/(protected)/dashboard/datasets/[dataset_id]/+page.server.ts`

## LDN Delivery Flow

1. Find all active applications with a non-null `inbox_url`.
2. POST the LDN JSON-LD payload to each inbox URL (`Content-Type: application/ld+json`).
3. Store a delivery record for each attempt in `LDNNotification`.
4. Mark `delivered` based on the HTTP result. Failures are logged but do not throw.

Code: `src/lib/server/repositories/ldn.repository.ts`

### Example LDN Payload (Publish)

```json
{
  "@context": "https://www.w3.org/ns/ldn-context.jsonld",
  "id": "urn:notification:7d5b2d2a-5f4c-4f47-9c3c-6f5d6b6b1f0a",
  "type": "Notification",
  "published": "2024-01-11T10:00:00.000Z",
  "actor": {
    "id": "https://example.org",
    "type": "Application",
    "name": "Your Dataspace"
  },
  "object": {
    "@id": "https://example.org/datasets/ckbftk3e20000l9i7a7g1nq4m",
    "@type": "dcat:Dataset",
    "dct:title": "Dataset Title"
  },
  "summary": "Dataset \"Dataset Title\" has been published."
}
```

## LDES Event Storage

LDES events are stored in the database and can be retrieved by dataset or in chronological order.

Repository functions:
- `LDESEventRepository.create` — persist new events.
- `LDESEventRepository.getByDatasetId` — audit a dataset’s events.
- `LDESEventRepository.getAll` — chronological stream access (cursor-based).
- `LDESEventRepository.getLatestByDatasetId` — build version chains.

Code: `src/lib/server/repositories/ldes.repository.ts`

### Example LDES Event Data (Update)

```json
{
  "@context": [
    "https://www.w3.org/ns/dcat.jsonld",
    "https://w3c.github.io/ldes/context.jsonld"
  ],
  "@id": "https://example.org/datasets/ckbftk3e20000l9i7a7g1nq4m",
  "@type": "dcat:Dataset",
  "dct:title": "Dataset Title",
  "dct:description": "Dataset description",
  "dct:identifier": "dataset-identifier",
  "dcat:theme": "http://publications.europa.eu/resource/authority/data-theme/ENER",
  "dct:license": "http://creativecommons.org/licenses/by/4.0/",
  "dcat:accessURL": "https://api.example.com/datasets/1",
  "dct:issued": "2024-01-10T10:00:00.000Z",
  "dct:modified": "2024-01-12T10:00:00.000Z"
}
```

## Inbox Endpoint

The project exposes an inbox-like endpoint at:

```
GET /datasets/{dataset_id}/ldes
POST /datasets/{dataset_id}/ldes
```

Notes:
- The `GET` response is an LDN inbox container with stored `LDNNotification` records.
- The `POST` handler accepts a notification payload and returns success, but does not persist or process the body.
- Despite the `/ldes` path, this endpoint currently behaves like an LDN inbox, not a full LDES stream.

Code: `src/routes/(protected)/datasets/[dataset_id]/ldes/+server.ts`

## Current Gaps

- There is no dedicated LDES stream endpoint that returns `LDESEvent` records.
- The `/datasets/{dataset_id}/ldes` route name can be misleading, since it exposes LDN inbox data.
*** End Patch"}`
