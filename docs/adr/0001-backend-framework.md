# ADR-0001: Backend Framework – ASP.NET Core Web API

## Status

Accepted

## Date

2026-05-14

---

## Context

The InnovatEPAM Portal requires a backend API to handle user authentication, idea submission, file attachment storage, idea evaluation workflows, and role-based access control. The platform will be hosted on EPAM's internal infrastructure and is accessible only to EPAM employees.

Key constraints and requirements:
- The team has existing proficiency in the Microsoft/.NET ecosystem.
- The platform is hosted on internal EPAM infrastructure, which may favour Windows-compatible stacks.
- The API must serve a React/TypeScript frontend over HTTP (REST).
- Security is a priority: JWT-based authentication, role enforcement, and secure file handling are required.
- The MVP must be delivered quickly; the framework must have low friction for rapid development.
- The system must support future extensibility (multi-stage review, scoring system) without a major rewrite.

Alternatives considered:

| Option | Pros | Cons |
|---|---|---|
| **ASP.NET Core Web API** | Mature, high-performance, strong DI, excellent EF Core integration, widely used at EPAM | Slightly verbose compared to minimal frameworks |
| Node.js + Express | Lightweight, fast startup | Weaker typing, less structure for enterprise use cases |
| Node.js + NestJS | Strong structure, TypeScript | Team unfamiliar; adds learning curve |
| Python + FastAPI | Fast development, clean syntax | Not aligned with EPAM's dominant stack; weaker Windows hosting fit |

---

## Decision

We will use **ASP.NET Core Web API (.NET 8)** as the backend framework.

The API will follow a layered architecture (Controllers → Services → Repositories) and expose RESTful endpoints consumed by the React frontend. Entity Framework Core will be used as the ORM. JWT Bearer authentication middleware will enforce role-based access.

---

## Consequences

**Positive:**
- Strong typing and compile-time safety reduce runtime errors.
- First-class integration with Entity Framework Core simplifies data access and migrations.
- Built-in dependency injection, middleware pipeline, and attribute-based routing accelerate development.
- Excellent tooling support in Visual Studio and VS Code.
- Scales naturally to future phases (multi-stage review, additional roles, external integrations).
- ASP.NET Core's built-in CORS, HTTPS enforcement, and security middleware align with OWASP best practices.

**Negative / Trade-offs:**
- More boilerplate than lightweight alternatives (e.g., Minimal API or Express) for simple endpoints.
- Requires .NET runtime on the host environment (already available on EPAM internal infrastructure).
- Team must maintain consistent layering discipline to avoid coupling as the codebase grows.

**Neutral:**
- Minimal API endpoints (introduced in .NET 6+) can be adopted for simpler routes if verbosity becomes a concern.
