# ADR-0003: Database – SQLite + Entity Framework Core

## Status

Accepted

## Date

2026-05-14

---

## Context

The InnovatEPAM Portal MVP requires persistent storage for the following entities:
- Users (credentials, roles)
- Ideas (title, description, category, status, timestamps)
- File attachment metadata (filename, path/blob reference, linked idea)
- Evaluation records (evaluator, comment, decision, timestamp)

The system will be hosted on EPAM's internal infrastructure during the MVP phase. Expected user base is limited to EPAM employees within a single business unit. Concurrent write load is low-to-moderate (employees submitting ideas; a small number of AdminEvaluators reviewing them).

The MVP must be deliverable quickly with minimal infrastructure overhead. A full database server (PostgreSQL, SQL Server) would introduce additional provisioning, licensing, and operational complexity that is not justified at this scale.

Alternatives considered:

| Option | Pros | Cons |
|---|---|---|
| **SQLite + EF Core** | Zero server setup, file-based, EF Core support, perfect for MVP scale | Not suited for high concurrency or distributed deployments |
| PostgreSQL + EF Core | Production-grade, scalable, open source | Requires server provisioning; overkill for MVP user load |
| SQL Server (Express) | Strong EPAM familiarity, EF Core native | Licensing considerations; server dependency; heavier setup |
| MongoDB | Flexible schema | No relational integrity; poor fit for structured idea/evaluation model |

---

## Decision

We will use **SQLite** as the database engine, accessed exclusively through **Entity Framework Core 8** with code-first migrations.

- The database file will be stored on the server's local file system in a designated data directory.
- EF Core's `DbContext` and `DbSet<T>` abstractions will be used for all data access; raw SQL is prohibited except for read-only reporting queries where EF Core LINQ is insufficient.
- Code-first **migrations** will manage all schema changes; no manual DDL scripts.
- The repository pattern will be applied to decouple data access from business logic, enabling a future swap to PostgreSQL or SQL Server with minimal service-layer changes.

---

## Consequences

**Positive:**
- Zero infrastructure dependency — no database server to provision, configure, or maintain for the MVP.
- EF Core provides a consistent, strongly-typed data access layer with LINQ support.
- Migrations enable reproducible, version-controlled schema evolution across environments (dev, staging, production).
- The repository abstraction means upgrading to PostgreSQL or SQL Server in a future phase requires only replacing the EF Core provider and connection string, not rewriting business logic.
- Simplifies local development setup for all team members.

**Negative / Trade-offs:**
- SQLite does not support high write concurrency; concurrent writes are serialised at the file level. This is acceptable for MVP load but must be reassessed if the user base scales significantly.
- No built-in support for advanced database features (e.g., full-text search, row-level locking). Full-text search in EP-005 will be implemented at the application layer.
- The database file must be included in backup procedures; loss of the file means loss of all data.

**Migration path:**
When the portal graduates beyond MVP (increased users, distributed deployment), the EF Core provider will be switched to **PostgreSQL via Npgsql** or **SQL Server** with no changes to the service or API layers, only to `DbContext` configuration and the connection string.
