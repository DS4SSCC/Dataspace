# OPA Access Control Mechanism

This document explains how Open Policy Agent (OPA) is used to authorize access to datasets.

## Core Concepts

- **PolicyIntent** controls whether a dataset is public, restricted, or internal.
- **Policy** records store Rego rules in the database and can be loaded into OPA.
- **Policy service** is the bridge between the app and the OPA server.
- **Dataset service** enforces policy decisions at access time.

## Data Models

### Dataset (policy-related fields)

- `policy_intent` (enum): `PUBLIC`, `RESTRICTED`, `INTERNAL`
- `policy_id` (string, nullable): FK to `Policy`
- `policy` (relation): optional policy attached to the dataset

### Policy

- `id` (string)
- `package` (string): OPA package path used when loading/querying
- `raw` (string): Rego policy source
- `active` (boolean): whether the policy should be loaded into OPA
- `name` (string)
- `description` (string, nullable)

## Where Policies Are Created/Updated

### Dataset update flow

When a dataset is updated via the dashboard:
- If `policy_intent` is `RESTRICTED` and no policy exists, a new `Policy` is created and linked.
- If a policy exists and `policy_raw` is provided, the policy is updated and reloaded into OPA.

Code: `src/routes/(protected)/dashboard/datasets/[dataset_id]/+page.server.ts`

## Policy Service (OPA integration)

The policy service manages OPA synchronization and execution:

- **load()**: checks OPA health, deletes all OPA policies, then loads all `active` policies from the database.
- **local.load(policy)**: loads a single policy into OPA.
- **local.execute(input, policy)**: loads the policy and evaluates it via OPA data API.
- **local.deactivate(policy)**: marks policy inactive and removes it from OPA.

Code: `src/lib/server/services/policy.service/index.ts`

## Enforcement Path

Dataset access uses a service route that enforces policy checks:

1. Authenticate with token guard.
2. Fetch dataset by ID.
3. If a policy exists, build an input object with the token data and dataset.
4. Execute OPA policy. If `result.allowed` is falsy, return 403.
5. If allowed, return the dataset access response.

Code: `src/lib/server/services/dataset.service/routes/index.ts`

## Service Routing

The app exposes service endpoints under:

```
/api/v1/services/{service_name}/...
```

Only the `policy` and `dataset` services are enabled in this route.

Code: `src/routes/(protected)/api/v1/services/[service_name]/[...catch]/+server.ts`

## Testing Policies

The dashboard exposes a policy test action that calls the policy service:

- POST action to test a policy with custom input.

Code: `src/routes/(protected)/dashboard/policies/[policy_id]/+page.server.ts`

## Notes and Current Behavior

- `PUBLIC` datasets skip policy checks entirely.
- `RESTRICTED` datasets rely on OPA to decide access.
- `INTERNAL` datasets are not meant for publication, but enforcement in the access route depends on the presence of a policy.
- Policy loading currently reloads all active policies when the policy service starts.
