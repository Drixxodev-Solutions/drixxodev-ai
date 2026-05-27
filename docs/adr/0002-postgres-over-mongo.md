# ADR-0002: PostgreSQL over MongoDB for primary datastore

**Date**: 2026-01-20  
**Status**: accepted  
**Deciders**: ECC maintainers  

## Context

Everything Claude Code (ECC) is a plugin and knowledge base, not a single long-running product with one runtime data model. Even so, examples, skills, and agent guidance repeatedly assume a **relational primary store** (PostgreSQL/Supabase patterns, `database-reviewer`, migration skills) rather than a document-first stack.

When choosing a default datastore for reference architectures and agent recommendations, we need a choice that fits **structured configuration**, **clear constraints**, and **familiar SQL tooling** across contributors—without forcing every consumer of ECC to adopt MongoDB operations.

## Decision

Use **PostgreSQL** (including Supabase-managed Postgres where relevant) as the **default primary datastore** in ECC guidance, examples, and database-reviewer workflows. Treat MongoDB as optional and workload-specific (e.g., document-native access patterns, Atlas Search/vector features), not as the default OLTP choice for this repository.

## Alternatives Considered

### Alternative 1: MongoDB as primary datastore

- **Pros**: Flexible schema evolution without upfront table design; natural fit for JSON-like agent payloads; strong horizontal scaling story; built-in search/vector/time-series capabilities on Atlas.
- **Cons**: ECC already centers Postgres patterns (`postgres-patterns` skill, Supabase docs); most contributors expect SQL migrations and joins for “system of record” data; document modeling requires deliberate access-pattern design (embedding vs referencing) to avoid application-level join complexity.
- **Why not**: For ECC’s **default** recommendations, relational modeling and Postgres ecosystem alignment outweigh MongoDB’s flexibility. MongoDB remains valid for specific workloads (see [When MongoDB still fits](#when-mongodb-still-fits)).

### Alternative 2: Polyglot default (no primary choice)

- **Pros**: Avoids locking documentation to one engine.
- **Cons**: Agents and skills lose a consistent baseline; duplicated guidance; higher chance of contradictory examples.
- **Why not**: ECC benefits from one clear default; consumers can still choose MongoDB where appropriate.

## Consequences

### Positive

- Aligns with existing `postgres-patterns`, migration, and `database-reviewer` agent coverage.
- SQL schemas and constraints match how many teams model **authoritative** business data.
- Easier cross-skill consistency (API design, backend patterns, verification loops).

### Negative

- Examples that need document-native or Atlas-only features must call that out explicitly.
- Teams already standardized on MongoDB may need to map ECC Postgres examples to their stack.

### Risks

- **Risk**: Drift—skills mention Postgres while a subproject uses MongoDB.  
  **Mitigation**: Record workload-specific ADRs when a repo diverges; use MongoDB plugin/skills for Mongo-specific design, not this default.

## Evidence (MongoDB official documentation)

This ADR was cross-checked with the MongoDB MCP **`search-knowledge`** tool (MongoDB Assistant / official docs), which highlights intentional trade-offs between relational and document databases:

| Relational (e.g. PostgreSQL) | Document (e.g. MongoDB) |
|------------------------------|-------------------------|
| Schema is typically defined before bulk insert; changes require planning for dependent references | Schema can evolve with application needs |
| Multi-table **joins** are common to assemble application views | **Embed** related data to match access patterns and reduce cross-collection joins |

Sources: [Data Modeling in MongoDB](https://www.mongodb.com/docs/manual/data-modeling) (relational vs document behavior table); [Transactions](https://www.mongodb.com/docs/manual/core/transactions) (single-document atomicity; multi-document transactions when needed).

These points support Postgres as ECC’s **default** for normalized, constraint-heavy “source of truth” data—not a claim that MongoDB is unsuitable for production OLTP.

## When MongoDB still fits

Prefer MongoDB (and ECC’s MongoDB plugin skills) when the dominant access pattern is:

- Document-shaped aggregates read/written together (embedding over normalizing).
- Atlas Search, vector search, or heavy aggregation on document data.
- Rapid schema iteration on heterogeneous records without relational migration overhead.

Use the **`mongodb-schema-design`** and **`mongodb-search-and-ai`** skills for those paths; use **`postgres-patterns`** for the default relational path.
