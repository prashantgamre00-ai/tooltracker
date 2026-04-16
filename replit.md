# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Applications

### Tool Tracker (artifacts/tool-tracker)
A location-based tool management web app. Users can add tools tagged with GPS coordinates, view tools filtered by location, and see a dashboard summary with stats.

**Pages:**
- `/` — Dashboard: total tools, active locations, most active site, location breakdown, recently added tools
- `/tools` — Tool inventory list with search and location filter; tool detail modal
- `/tools/new` — Add a new tool with geolocation detection
- `/locations` — Manage job site locations (add, view, delete)

**API routes (artifacts/api-server/src/routes):**
- `GET/POST /api/tools` — list and create tools
- `GET/PUT/DELETE /api/tools/:id` — get, update, delete a tool
- `GET/POST /api/locations` — list and create locations
- `DELETE /api/locations/:id` — delete a location
- `GET /api/dashboard/summary` — dashboard summary stats
- `GET /api/dashboard/by-location` — tool counts grouped by location
- `GET /api/dashboard/recent` — recently added tools

**Database schema (lib/db/src/schema):**
- `locations` — id, name, address, latitude, longitude, createdAt
- `tools` — id, name, description, category, condition, locationId (FK), latitude, longitude, createdAt, updatedAt

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Important Notes

- After running codegen, manually set `lib/api-zod/src/index.ts` to only `export * from "./generated/api";` (codegen duplicates exports causing TS errors)
- The `lib/api-zod/src/index.ts` file must NOT re-export `./generated/types` as it conflicts with `./generated/api`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
