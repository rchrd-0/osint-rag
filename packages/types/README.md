# @osint-rag/types

Shared API contract types for the monorepo.

## Keep Here

- Request/response DTOs shared by server and web
- Stable frontend-consumed shapes like `DocumentItem` and `DocumentDetail`
- Small reusable API primitives like `ApiResponse`

## Keep Out

- Prisma model types
- DB insert/update shapes
- Script-only types like Guardian ingestion payloads
- Server service/repository internals
- Model/provider-specific AI types

## Rule Of Thumb

If both server and web should depend on a type as part of the API contract, it belongs here.

If a type is only for database, scripts, or server implementation details, keep it local to that package/app.
