# Implementation Plan: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-innovatepam-portal/spec.md`

---

## Summary

Build an internal web portal enabling EPAM employees to submit innovation ideas and AdminEvaluators to review, accept, or reject them. The backend is an **ASP.NET Core 8 Web API** with **SQLite + EF Core** and **JWT Bearer authentication**. The frontend is a **React 18 + TypeScript** SPA (Vite) styled with **Tailwind CSS** and **shadcn/ui**. No automated tests; manual verification against spec acceptance criteria only.

---

## Technical Context

| Field                  | Value                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Backend Language**   | C# 12 / .NET 8                                                                   |
| **Frontend Language**  | TypeScript 5 / React 18                                                          |
| **Backend Framework**  | ASP.NET Core Web API                                                             |
| **Frontend Framework** | React + Vite                                                                     |
| **Styling**            | Tailwind CSS v3 + shadcn/ui (Radix UI)                                           |
| **ORM**                | Entity Framework Core 8                                                          |
| **Database**           | SQLite (file-based)                                                              |
| **Authentication**     | JWT Bearer (access token) + Refresh Token (HttpOnly cookie)                      |
| **HTTP Client**        | Axios                                                                            |
| **Routing**            | React Router v6                                                                  |
| **Testing**            | None — manual verification only                                                  |
| **Target Platform**    | EPAM internal infrastructure (Windows/Linux server + modern browsers)            |
| **Performance Goal**   | Idea listing renders ≤ 3 s for 100 ideas; registration + login ≤ 2 min           |
| **Constraints**        | Single file attachment ≤ 10 MB; @epam.com email only; page size 20               |
| **Scale / Scope**      | MVP — internal EPAM users, single business unit, low-to-moderate concurrent load |

---

## Constitution Check

| Rule                                 | Status  | Note                                         |
| ------------------------------------ | ------- | -------------------------------------------- |
| ASP.NET Core Web API                 | ✅ Pass | Matches mandatory stack                      |
| React + TypeScript                   | ✅ Pass | Matches mandatory stack                      |
| Tailwind CSS + shadcn/ui             | ✅ Pass | Matches mandatory stack                      |
| SQLite + EF Core                     | ✅ Pass | Matches mandatory stack                      |
| JWT authentication                   | ✅ Pass | Matches mandatory stack                      |
| No automated tests                   | ✅ Pass | Manual verification only per constitution §3 |
| No duplicate CSS/component libraries | ✅ Pass | Only Tailwind + shadcn/ui                    |
| No additional ORMs                   | ✅ Pass | EF Core only                                 |
| Minimal dependencies                 | ✅ Pass | No speculative packages added                |
| Single Responsibility (layered arch) | ✅ Pass | Controllers → Services → Repositories        |

**Constitution check: PASSED. Proceeding to Phase 1.**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-innovatepam-portal/
├── spec.md          ← /speckit.specify output  (Status: Clarified)
├── plan.md          ← This file  (/speckit.plan output)
├── research.md      ← Phase 0 technical research
├── data-model.md    ← Phase 1 entity + schema reference
├── quickstart.md    ← Phase 1 local dev setup guide
├── contracts/
│   ├── auth.md         ← Auth API contract
│   ├── ideas.md        ← Ideas API contract
│   └── evaluations.md  ← Evaluations API contract
└── tasks.md         ← /speckit.tasks output  (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
InnovatEpam/
├── backend/
│   └── InnovatEpam.Api/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── IdeasController.cs
│       │   └── EvaluationsController.cs
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   ├── Seeder.cs
│       │   └── Migrations/
│       ├── DTOs/
│       │   ├── Auth/
│       │   │   ├── RegisterRequest.cs
│       │   │   ├── LoginRequest.cs
│       │   │   └── LoginResponse.cs
│       │   ├── Ideas/
│       │   │   ├── CreateIdeaRequest.cs
│       │   │   ├── IdeaResponse.cs
│       │   │   └── IdeaListResponse.cs
│       │   └── Evaluations/
│       │       └── EvaluateRequest.cs
│       ├── Models/
│       │   ├── User.cs
│       │   ├── Idea.cs
│       │   ├── Attachment.cs
│       │   ├── Evaluation.cs
│       │   └── RefreshToken.cs
│       ├── Services/
│       │   ├── AuthService.cs
│       │   ├── IdeaService.cs
│       │   ├── EvaluationService.cs
│       │   └── FileStorageService.cs
│       ├── Middleware/
│       │   └── ErrorHandlingMiddleware.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       └── Program.cs
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  ← shadcn/ui primitives (Button, Input, Badge, Dialog…)
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx     ← nav + role-aware sidebar
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── ideas/
│   │   │   │   ├── IdeaCard.tsx
│   │   │   │   ├── IdeaStatusBadge.tsx
│   │   │   │   └── EvaluationDialog.tsx
│   │   │   └── forms/
│   │   │       ├── RegisterForm.tsx
│   │   │       ├── LoginForm.tsx
│   │   │       └── IdeaSubmitForm.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── MyIdeasPage.tsx        ← Submitter: own ideas list
│   │   │   ├── IdeaSubmitPage.tsx
│   │   │   ├── IdeaDetailPage.tsx
│   │   │   └── AdminDashboard.tsx     ← AdminEvaluator: all ideas
│   │   ├── services/
│   │   │   ├── api.ts               ← Axios instance + interceptors
│   │   │   ├── authApi.ts
│   │   │   ├── ideasApi.ts
│   │   │   └── evaluationsApi.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx      ← user, role, token state
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useIdeas.ts
│   │   ├── types/
│   │   │   └── index.ts             ← shared TS types matching API DTOs
│   │   ├── lib/
│   │   │   └── utils.ts             ← cn() helper, date formatters
│   │   ├── App.tsx                  ← router + route guards
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── prd.md
│   ├── constitution.md
│   ├── stories.md
│   ├── epics.md
│   └── adr/
│       ├── 0001-backend-framework.md
│       ├── 0002-frontend-framework.md
│       ├── 0003-database.md
│       ├── 0004-authentication.md
│       └── 0005-ui-components.md
└── specs/
    └── 001-innovatepam-portal/
        └── [this directory]
```

**Structure Decision**: Option 2 (Web application) — separate `backend/` and `frontend/` top-level directories under the repo root. The backend is a single ASP.NET Core API project. The frontend is a single Vite + React app. No microservices, no monorepo tooling — the simplest structure that satisfies the MVP scope.

---

## Implementation Phases

### Phase 0 — Research _(complete)_

- Stack compatibility confirmed (see [research.md](./research.md))
- Spec clarified and promoted to status `Clarified`
- No blocking unknowns

### Phase 1 — Design _(complete)_

- Data model defined (see [data-model.md](./data-model.md))
- API contracts defined (see [contracts/](./contracts/))
- Local dev quickstart written (see [quickstart.md](./quickstart.md))

### Phase 2 — Implementation _(tasks generated by /speckit.tasks)_

Delivery order follows story priority and dependency chain:

| Order | Feature Slice                                                  | Depends On | FR Coverage                   |
| ----- | -------------------------------------------------------------- | ---------- | ----------------------------- |
| 1     | Backend: EF Core models + migrations + seeder                  | —          | FR-016, FR-017                |
| 2     | Backend: JWT auth endpoints (register, login, refresh, logout) | 1          | FR-001–FR-003, FR-013–FR-016  |
| 3     | Frontend: Auth pages (register, login, logout, route guards)   | 2          | US-1                          |
| 4     | Backend: Idea submission + file upload endpoints               | 2          | FR-004, FR-005, FR-015        |
| 5     | Frontend: Idea submission form + file attachment               | 3, 4       | US-2                          |
| 6     | Backend: Idea listing + search + filter endpoints              | 4          | FR-006, FR-009–FR-011         |
| 7     | Frontend: My Ideas page (Submitter)                            | 3, 6       | US-2, US-4                    |
| 8     | Backend: Evaluation endpoints (start review, accept, reject)   | 4          | FR-006–FR-008, FR-012, FR-014 |
| 9     | Frontend: Admin dashboard + evaluation dialog                  | 3, 8       | US-3                          |
| 10    | Frontend: Idea detail page (status + comment display)          | 7, 9       | US-3, US-4                    |

---

## Complexity Tracking

No constitution violations. All design choices are within the permitted stack and MVP scope.
