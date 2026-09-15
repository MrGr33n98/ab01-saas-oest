# ADR 002 — PostGIS geography strategy

## Status

Accepted

## Context

Coverage, AOI, and matching depend on real geospatial predicates. Lat/lng pairs alone are insufficient.

## Decision

- Use `geography(Point|MultiPolygon, 4326)` for AOI and coverage.
- Eligibility uses `ST_Intersects` / `ST_Covers` / `ST_DWithin` with GiST indexes.
- Area in hectares is always computed server-side; the frontend is never the source of truth.
- Geometry simplification is only for display, never for eligibility decisions.

## Consequences

- Requires PostGIS in all environments (local, CI, staging, production).
- Migrations and `structure.sql` must enable the PostGIS extension.
