# API types (generated)

`../lib/api-types.ts` is generated from the backend OpenAPI document and is the
single source of truth for backend response/request shapes. Do not edit it by hand;
each module's `schema.ts` aliases the generated schemas (see `lib/api-contract.ts`).

## Regenerate

With the backend running (`app/` service exposes the spec at `/v3/api-docs`):

```bash
# 1. snapshot the live spec
curl -s http://localhost:8080/v3/api-docs -o openapi/openapi.json

# 2. regenerate the TypeScript types
npx openapi-typescript openapi/openapi.json -o lib/api-types.ts
```

Commit both `openapi/openapi.json` and `lib/api-types.ts` together so the snapshot and
the generated types never drift.

## Nullability

springdoc does not emit `required`, so every field is generated as optional. Response
DTOs are always fully populated by the backend, so `lib/api-contract.ts` exposes
`DeepRequired<T>` / `Schema<K>` to consume them ergonomically while preserving genuine
`| null` unions. The correct long-term fix is to make the backend declare required
fields; then `DeepRequired` can be dropped.
