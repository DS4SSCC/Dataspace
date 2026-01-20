# API Documentation

This project exposes a CKAN-inspired API under the SvelteKit `/(protected)` group. The `api_version` path segment is dynamic but currently not used to change behavior; any string will route to the same handlers.

## Base Path

```
/api/{api_version}/action
```

## Data Models (Prisma-backed)

### Catalog

Fields:
- `id` (string, cuid)
- `name` (string, unique)
- `title` (string)
- `description` (string, nullable)
- `logo_url` (string, nullable)
- `api_standard` (string)
- `api_url` (string)
- `api_key` (string, nullable)
- `is_active` (boolean)
- `last_sync` (datetime, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

### Dataset

Fields:
- `id` (string, cuid)
- `catalog_id` (string, FK -> Catalog)
- `title` (string)
- `description` (string)
- `identifier` (string)
- `issued` (datetime, nullable)
- `modified` (datetime, nullable)
- `language` (string, nullable)
- `theme` (string, nullable)
- `spatial` (string, nullable)
- `temporal_start` (datetime, nullable)
- `temporal_end` (datetime, nullable)
- `license` (string, nullable)
- `access_rights` (string, nullable)
- `access_url` (string, nullable)
- `download_url` (string, nullable)
- `media_type` (string, nullable)
- `is_published` (boolean)
- `policy_intent` (enum: `PUBLIC`, `RESTRICTED`, `INTERNAL`)
- `policy_id` (string, nullable)
- `notes` (string, nullable)
- `imported_at` (datetime)
- `published_at` (datetime, nullable)

## Endpoints

### Package List

`GET /api/{api_version}/action/package_list`

Returns all published datasets.

Response format:
```json
{
  "success": true,
  "result": [
    {
      "id": "ckbftk3e20000l9i7a7g1nq4m",
      "catalog_id": "ckbftk3e20000l9i7a7g1nq4a",
      "title": "Dataset Title",
      "description": "Dataset description",
      "identifier": "dataset-identifier",
      "issued": "2024-01-10T10:00:00.000Z",
      "modified": "2024-01-12T10:00:00.000Z",
      "language": "en",
      "theme": "http://publications.europa.eu/resource/authority/data-theme/ENER",
      "spatial": "Eindhoven",
      "temporal_start": "2024-01-01T00:00:00.000Z",
      "temporal_end": "2024-12-31T00:00:00.000Z",
      "license": "http://creativecommons.org/licenses/by/4.0/",
      "access_rights": "http://publications.europa.eu/resource/authority/access-right/PUBLIC",
      "access_url": "https://api.example.com/datasets/1",
      "download_url": "https://api.example.com/datasets/1.csv",
      "media_type": "application/json",
      "is_published": true,
      "policy_intent": "PUBLIC",
      "policy_id": null,
      "notes": null,
      "imported_at": "2024-01-10T10:00:00.000Z",
      "published_at": "2024-01-11T10:00:00.000Z"
    }
  ]
}
```

### Package Show

`GET /api/{api_version}/action/package_show?id={id_or_identifier}`

Returns a CKAN-like package object for a single dataset. The lookup uses `id` or `identifier`.

Response format:
```json
{
  "success": true,
  "result": {
    "id": "ckbftk3e20000l9i7a7g1nq4m",
    "name": "dataset_identifier",
    "title": "Dataset Title",
    "notes": "Dataset description",
    "metadata_created": "2024-01-10T10:00:00.000Z",
    "metadata_modified": "2024-01-12T10:00:00.000Z",
    "license_id": "cc-by",
    "organization": {
      "id": "ckbftk3e20000l9i7a7g1nq4a",
      "name": "catalog-name",
      "title": "Catalog Title",
      "description": "Catalog description"
    },
    "resources": [
      {
        "id": "ckbftk3e20000l9i7a7g1nq4m-access",
        "url": "https://api.example.com/datasets/1",
        "format": "application/json",
        "name": "Access endpoint"
      },
      {
        "id": "ckbftk3e20000l9i7a7g1nq4m-download",
        "url": "https://api.example.com/datasets/1.csv",
        "format": "application/json",
        "name": "Download"
      }
    ],
    "tags": [
      { "name": "ener" }
    ],
    "isopen": true
  }
}
```

Error format:
```json
{
  "success": false,
  "error": {
    "__type": "Validation Error",
    "message": "Missing \"id\" parameter"
  }
}
```

```json
{
  "success": false,
  "error": {
    "__type": "Not Found Error",
    "message": "Dataset not found"
  }
}
```

### Package Search

`POST /api/{api_version}/action/package_search`

Request body:
```json
{
  "q": "search text",
  "rows": 20,
  "start": 0
}
```

Response format:
```json
{
  "success": true,
  "result": {
    "count": 2,
    "results": [
      {
        "id": "ckbftk3e20000l9i7a7g1nq4m",
        "name": "dataset_identifier",
        "title": "Dataset Title"
      }
    ]
  }
}
```

Notes:
- `rows` is capped at 100.
- Search matches `title`, `description`, and `identifier` (case-insensitive).
- The response objects are intentionally minimal; only `id`, `name`, and `title` are currently returned.
