---
description: "Task list for InnovatEPAM Portal implementation"
---

# Tasks: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14

**Input**: Design documents from `/specs/001-innovatepam-portal/`

**References**: [spec.md](./spec.md) · [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/)

**Tests**: None — manual verification only per constitution §3.

---

## Format

- `[P]` — can run in parallel with other `[P]` tasks in the same phase (different files, no conflict)
- `[US?]` — user story this task delivers value for
- Paths are relative to repo root (`InnovatEpam/`)

---

## Phase 1: Project Setup

**Purpose**: Scaffold both projects and wire shared configuration. Nothing else can start until this is done.

- [x] T001 Create ASP.NET Core Web API project — `backend/InnovatEpam.Api/` (`dotnet new webapi -n InnovatEpam.Api`)
- [x] T002 [P] Create React + TypeScript frontend project via Vite — `frontend/` (`npm create vite@latest frontend -- --template react-ts`)
- [x] T003 Add NuGet packages to backend: `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.EntityFrameworkCore.Design`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `BCrypt.Net-Next` — `backend/InnovatEpam.Api/InnovatEpam.Api.csproj`
- [x] T004 [P] Install frontend npm packages: `axios`, `react-router-dom`, `@types/react-router-dom`, `clsx`, `tailwind-merge` — `frontend/package.json`
- [x] T005 [P] Initialise shadcn/ui in the frontend (`npx shadcn-ui@latest init`) and add components: Button, Input, Badge, Dialog, Select, Table, Label, Textarea — `frontend/src/components/ui/`
- [x] T006 [P] Configure Tailwind CSS — create `frontend/tailwind.config.ts` with content paths and design tokens; update `frontend/src/index.css` with Tailwind directives
- [x] T007 [P] Configure Vite proxy: forward `/api/*` to `https://localhost:7001` — `frontend/vite.config.ts`
- [x] T008 [P] Add `appsettings.Development.json` (git-ignored) with JWT secret, connection string, upload path — `backend/InnovatEpam.Api/appsettings.Development.json`
- [x] T009 [P] Add `.gitignore` entries: `*.db`, `appsettings.Development.json`, `uploads/`, `node_modules/`, `dist/`

**Checkpoint**: Both projects start (`dotnet run` and `npm run dev`) with no errors before proceeding.

---

## Phase 2: Foundation — Shared Backend Infrastructure

**Purpose**: EF Core data layer, JWT middleware, error handling. Every user story depends on this.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T010 Create enum types — `backend/InnovatEpam.Api/Models/Enums.cs` (Role, IdeaCategory, IdeaStatus, EvaluationDecision)
- [x] T011 [P] Create `User` entity — `backend/InnovatEpam.Api/Models/User.cs`
- [x] T012 [P] Create `Idea` entity — `backend/InnovatEpam.Api/Models/Idea.cs`
- [x] T013 [P] Create `Attachment` entity — `backend/InnovatEpam.Api/Models/Attachment.cs`
- [x] T014 [P] Create `Evaluation` entity — `backend/InnovatEpam.Api/Models/Evaluation.cs`
- [x] T015 [P] Create `RefreshToken` entity — `backend/InnovatEpam.Api/Models/RefreshToken.cs`
- [x] T016 Create `AppDbContext` with all DbSets, fluent config (unique indexes, enum-as-string conversions, FK delete behaviours) — `backend/InnovatEpam.Api/Data/AppDbContext.cs` (depends on T010–T015)
- [x] T017 Create `Seeder.cs` — inserts default AdminEvaluator (`admin@epam.com` / `Admin1234`) if none exists; idempotent — `backend/InnovatEpam.Api/Data/Seeder.cs`
- [x] T018 Add initial EF Core migration and verify SQLite schema (`dotnet ef migrations add InitialCreate`) — `backend/InnovatEpam.Api/Data/Migrations/`
- [x] T019 [P] Implement `ErrorHandlingMiddleware` — catches unhandled exceptions, returns `{ "error": "..." }` JSON, logs detail server-side; never exposes stack traces — `backend/InnovatEpam.Api/Middleware/ErrorHandlingMiddleware.cs`
- [x] T020 Configure `Program.cs`: register `AppDbContext`, JWT Bearer auth, CORS (dev: `http://localhost:5173`; production: read from `CORS__AllowedOrigin` env var), `ErrorHandlingMiddleware`, call `Seeder.Seed()` on startup — `backend/InnovatEpam.Api/Program.cs`
- [x] T021 [P] Create shared TypeScript types matching all API DTOs — `frontend/src/types/index.ts` (User, IdeaSummary, IdeaDetail, PagedResult, Role, IdeaStatus, IdeaCategory, EvaluationDecision)
- [x] T022 [P] Create Axios instance with base URL and request interceptor to attach `Authorization: Bearer <token>` header — `frontend/src/services/api.ts`
- [x] T023 [P] Create `AuthContext` with state: `{ user, accessToken, setAuth, clearAuth }` and `AuthProvider` wrapper — `frontend/src/context/AuthContext.tsx`
- [x] T024 Create `useAuth` hook — exports `{ user, role, isAuthenticated, login, logout }` — `frontend/src/hooks/useAuth.ts`
- [x] T025 [P] Create `ProtectedRoute` component — redirects to `/login` if not authenticated; renders 403 page if authenticated but wrong role — `frontend/src/components/layout/ProtectedRoute.tsx`
- [x] T026 [P] Create `AppShell` component — top nav with app name, user name, role badge, logout button; Submitter sidebar: "My Ideas", "Submit Idea"; AdminEvaluator sidebar: "Admin Dashboard" only — `frontend/src/components/layout/AppShell.tsx`
- [x] T027 Create `cn()` utility (clsx + tailwind-merge) — `frontend/src/lib/utils.ts`
- [x] T076 Create backend constants file — `backend/InnovatEpam.Api/Constants/AppConstants.cs` with: `MaxFileSizeBytes = 10_485_760`, `AllowedMimeTypes` string array (pdf, docx, png, jpg), `DefaultPageSize = 20`, `MaxCommentLength = 2000`, `EpamEmailDomain = "@epam.com"`, `AccessTokenExpiryMinutes = 60`, `RefreshTokenExpiryDays = 7`
- [x] T077 [P] Create frontend constants file — `frontend/src/lib/constants.ts` with: `MAX_FILE_SIZE_BYTES`, `ALLOWED_FILE_TYPES`, `DEFAULT_PAGE_SIZE`, `IDEA_CATEGORIES`, `IDEA_STATUSES`
- [x] T078 Add login rate limiting — register `Microsoft.AspNetCore.RateLimiting` (built-in .NET 8, no extra package) fixed-window policy: max 10 requests / 1 minute per IP on `POST /api/auth/login`; return 429 with `{ "error": "Too many login attempts. Please try again later." }` — `backend/InnovatEpam.Api/Program.cs`

**Checkpoint**: API starts, migrations applied, seed user created. Frontend starts with AuthContext and routing skeleton in place.

---

## Phase 3: User Story 1 — Secure Registration and Login (Priority: P1) 🎯

**Goal**: An EPAM employee can register, log in, and log out. Role-based route protection works. No other feature needs to exist.

**Manual Verification**: Register `test@epam.com`, login → Submitter dashboard. Logout → redirected to login. Login as `admin@epam.com` → Admin dashboard. Direct URL to admin page as Submitter → Access Denied.

### Backend — Auth

- [x] T028 Create `RegisterRequest` DTO with data annotations (`[EmailAddress]`, `@epam.com` custom validator, `[MinLength(8)]`) — `backend/InnovatEpam.Api/DTOs/Auth/RegisterRequest.cs`
- [x] T029 [P] Create `LoginRequest` DTO — `backend/InnovatEpam.Api/DTOs/Auth/LoginRequest.cs`
- [x] T030 [P] Create `LoginResponse` DTO — `backend/InnovatEpam.Api/DTOs/Auth/LoginResponse.cs` (`{ accessToken, user: { id, fullName, email, role } }`)
- [x] T031 Implement `AuthService` with methods: `RegisterAsync` (hash password, validate @epam.com, 409 on duplicate), `LoginAsync` (verify BCrypt hash, generate JWT + refresh token), `RefreshAsync` (validate + rotate refresh token), `LogoutAsync` (revoke refresh token) — `backend/InnovatEpam.Api/Services/AuthService.cs`
- [x] T032 Implement `AuthController` with endpoints: `POST /api/auth/register`, `POST /api/auth/login` (sets HttpOnly cookie), `POST /api/auth/refresh`, `POST /api/auth/logout` (clears cookie) — `backend/InnovatEpam.Api/Controllers/AuthController.cs`
- [x] T033 Add password policy validator: min 8 chars, ≥1 uppercase, ≥1 number — reusable method in `AuthService` or a custom `ValidationAttribute` in DTOs; use `AppConstants.EpamEmailDomain` for domain check (no inline string literals)

### Frontend — Auth

- [x] T034 Implement `authApi.ts` — `register()`, `login()`, `refresh()`, `logout()` functions using Axios — `frontend/src/services/authApi.ts`
- [x] T035 Add Axios response interceptor: on 401, attempt `refresh()`, retry original request once; on second 401, call `clearAuth()` and redirect to `/login` — `frontend/src/services/api.ts`
- [x] T036 [P] Create `RegisterForm` component — fields: email, full name, password; inline validation matching server rules; submit calls `register()`, on success redirect to `/login` — `frontend/src/components/forms/RegisterForm.tsx`
- [x] T037 [P] Create `LoginForm` component — fields: email, password; on success calls `setAuth()` with token + user, redirects by role (`/my-ideas` for Submitter, `/admin` for AdminEvaluator) — `frontend/src/components/forms/LoginForm.tsx`
- [x] T038 Create `RegisterPage` — centred card layout using `AppShell`-less wrapper — `frontend/src/pages/RegisterPage.tsx`
- [x] T039 [P] Create `LoginPage` — centred card layout with link to register — `frontend/src/pages/LoginPage.tsx`
- [x] T040 Wire routes in `App.tsx`: `/register`, `/login` (public); `/my-ideas`, `/ideas/new`, `/ideas/:id` (Submitter); `/admin`, `/ideas/:id` (AdminEvaluator); `*` → redirect — `frontend/src/App.tsx`

**Checkpoint**: US1 fully functional. Registration, login, logout, and route protection all verified manually per spec acceptance criteria 1–6.

---

## Phase 4: User Story 2 — Idea Submission with File Attachment (Priority: P1) 🎯

**Goal**: A Submitter can submit an idea with title, description, category, and an optional file. Submission appears in "My Ideas" with status `Submitted`.

**Manual Verification**: Submit idea with file → confirmation shown, idea in My Ideas as `Submitted`. Submit without required field → inline errors. Attach oversized file → error. AdminEvaluator sees the new idea in dashboard.

### Backend — Idea Submission

- [x] T041 Create `CreateIdeaRequest` DTO — fields: `title`, `description`, `category` (enum), `file` (IFormFile, optional); add `[Required]`, `[MaxLength]` annotations — `backend/InnovatEpam.Api/DTOs/Ideas/CreateIdeaRequest.cs`
- [x] T042 Create `IdeaResponse` DTO (detail shape) and `IdeaSummaryResponse` DTO (list shape) — `backend/InnovatEpam.Api/DTOs/Ideas/IdeaResponse.cs`
- [x] T043 Implement `FileStorageService` — `ValidateFile()` (MIME whitelist: pdf, docx, png, jpg; max 10 MB; `Path.GetFileName()` sanitisation), `SaveAsync()` (write to `uploads/{ideaId}/`), `GetFilePath()` — `backend/InnovatEpam.Api/Services/FileStorageService.cs`
- [x] T044 Implement `IdeaService.CreateAsync()` — saves `Idea` entity (status = Submitted), calls `FileStorageService.SaveAsync()` if file present, saves `Attachment` entity — `backend/InnovatEpam.Api/Services/IdeaService.cs`
- [x] T045 Add `POST /api/ideas` to `IdeasController` — `[Authorize(Roles="Submitter")]`, calls `IdeaService.CreateAsync()`, returns 201 with `IdeaResponse` — `backend/InnovatEpam.Api/Controllers/IdeasController.cs`

### Frontend — Idea Submission

- [x] T046 Implement `ideasApi.ts` — `createIdea(formData: FormData)` using `multipart/form-data` — `frontend/src/services/ideasApi.ts`
- [x] T047 Create `IdeaSubmitForm` component — fields: title (text), description (textarea), category (Select from shadcn/ui with fixed options), file (input type=file, client-side size/type validation); on submit sends FormData; shows confirmation with idea ID on success — `frontend/src/components/forms/IdeaSubmitForm.tsx`
- [x] T048 Create `IdeaSubmitPage` — wraps `IdeaSubmitForm` inside `AppShell` — `frontend/src/pages/IdeaSubmitPage.tsx`
- [x] T049 Create `IdeaStatusBadge` component — colour-coded Badge for Submitted/UnderReview/Accepted/Rejected — `frontend/src/components/ideas/IdeaStatusBadge.tsx`
- [x] T050 Create `MyIdeasPage` (initial version) — fetches `GET /api/ideas`, renders table with title, category, status badge, date; empty state message if no ideas; "Submit New Idea" button — `frontend/src/pages/MyIdeasPage.tsx`

**Checkpoint**: US2 fully functional. Submitter flow from form to confirmation to "My Ideas" list verified manually per spec acceptance criteria 1–5.

---

## Phase 5: User Story 3 — Admin Evaluation Workflow (Priority: P1) 🎯

**Goal**: An AdminEvaluator can start review, then accept or reject an idea with a mandatory comment. Submitter sees the updated status and comment on the idea detail page.

**Manual Verification**: AdminEvaluator: Start Review → status `UnderReview`. Accept with comment → status `Accepted`. Reject with comment → status `Rejected`. Try accept with empty comment → blocked with error. Submitter opens idea detail → sees final status and evaluator comment.

### Backend — Evaluation

- [x] T051 Create `EvaluateRequest` DTO — `decision` (EvaluationDecision enum), `comment` (string, `[Required]`, `[MinLength(1)]`, `[MaxLength(2000)]`) — `backend/InnovatEpam.Api/DTOs/Evaluations/EvaluateRequest.cs`
- [x] T052 Implement `EvaluationService.StartReviewAsync()` — validates idea exists and is `Submitted`, transitions to `UnderReview`, updates `UpdatedAt`, saves — returns 409 if invalid transition — `backend/InnovatEpam.Api/Services/EvaluationService.cs`
- [x] T053 Implement `EvaluationService.EvaluateAsync()` — validates idea is `UnderReview`, creates `Evaluation` entity (decision + comment + evaluator + timestamp), transitions idea to `Accepted` or `Rejected`, updates `UpdatedAt` — `backend/InnovatEpam.Api/Services/EvaluationService.cs`
- [x] T054 Add `PATCH /api/ideas/{id}/review` and `POST /api/ideas/{id}/evaluate` to `IdeasController` — both `[Authorize(Roles="AdminEvaluator")]`; return 409 with `{ error, currentStatus }` on invalid transitions — `backend/InnovatEpam.Api/Controllers/IdeasController.cs`
- [x] T055 Add `GET /api/ideas/{id}` to `IdeasController` — returns full `IdeaResponse` including nested evaluation (comment, decision, evaluator name, timestamp) and attachment file name; Submitter scoped to own idea (403 if not owner) — `backend/InnovatEpam.Api/Controllers/IdeasController.cs`

### Frontend — Evaluation

- [x] T056 Implement `evaluationsApi.ts` — `startReview(ideaId)`, `evaluate(ideaId, { decision, comment })` — `frontend/src/services/evaluationsApi.ts`
- [x] T057 Create `EvaluationDialog` component — Dialog (shadcn/ui) with decision selector (Accept / Reject), required comment Textarea, submit button; client-side validation: comment must not be blank; shows server 409 message if status conflict — `frontend/src/components/ideas/EvaluationDialog.tsx`
- [x] T058 Create `AdminDashboard` page — fetches `GET /api/ideas` (all ideas, AdminEvaluator scope), renders table with title, submitter, category, status badge, action buttons ("Start Review" / "Evaluate"); mounts `EvaluationDialog` on action click — `frontend/src/pages/AdminDashboard.tsx`
- [x] T059 Create `IdeaDetailPage` — fetches `GET /api/ideas/:id`; shows full title, description, category, status badge, attachment download link (if any), evaluator comment block (only visible when status is Accepted or Rejected); accessible to both roles — `frontend/src/pages/IdeaDetailPage.tsx`

**Checkpoint**: US3 fully functional. Full evaluation cycle verified manually per spec acceptance criteria 1–5 for US3.

---

## Phase 6: User Story 4 — Idea Listing, Search, and Filtering (Priority: P2)

**Goal**: Any authenticated user can search ideas by keyword and filter by category and status within their role-scoped view.

**Manual Verification**: Search "blockchain" → only matching ideas shown. Filter by category "Technology" → filtered list. Filter by status "Submitted" → filtered list. Clear filter → all ideas shown. Empty result → empty state message. Click idea → detail page opens.

### Backend — Listing Enhancements

- [x] T060 Implement `IdeaService.GetPagedAsync()` — accepts `(userId, role, page, pageSize, search, category?, status?)`, applies role scope (`WHERE SubmitterId = userId` for Submitter), applies EF Core LINQ `.Where()` for search (title or description contains), category and status filters, `.Skip().Take()` for pagination, returns `{ items, totalCount, page, pageSize }` — `backend/InnovatEpam.Api/Services/IdeaService.cs`
- [x] T061 Add `GET /api/ideas` to `IdeasController` — reads query params (`page`, `pageSize`, `search`, `category`, `status`), calls `IdeaService.GetPagedAsync()`, returns `IdeaListResponse` — `backend/InnovatEpam.Api/Controllers/IdeasController.cs`
- [x] T062 Add `GET /api/ideas/{id}/attachment` to `IdeasController` — returns `FileResult` from `FileStorageService.GetFilePath()`; Submitter scoped to own idea; 404 if no attachment — `backend/InnovatEpam.Api/Controllers/IdeasController.cs`

### Frontend — Listing Enhancements

- [x] T063 Add `getIdeas(params)` and `getIdeaById(id)` to `ideasApi.ts` — `frontend/src/services/ideasApi.ts`
- [x] T064 Create `useIdeas` hook — manages `{ ideas, totalCount, page, isLoading }`, exposes `setPage`, `setSearch`, `setCategory`, `setStatus` — `frontend/src/hooks/useIdeas.ts`
- [x] T065 [P] Create `IdeaCard` component — shows title, category, status badge, submitter name (admin view), date, link to detail page — `frontend/src/components/ideas/IdeaCard.tsx`
- [x] T066 [P] Create reusable `PaginationControls` component — prev/next buttons with "Page N of M" display — `frontend/src/components/ui/PaginationControls.tsx`
- [x] T067 Update `MyIdeasPage` — add search input, category filter (Select), status filter (Select), wire to `useIdeas` hook, add `PaginationControls`, show result count — `frontend/src/pages/MyIdeasPage.tsx`
- [x] T068 Update `AdminDashboard` — add search input, category filter, status filter, wire to `useIdeas` hook, add `PaginationControls` — `frontend/src/pages/AdminDashboard.tsx`

**Checkpoint**: US4 fully functional. Search, filter, pagination, and idea detail page verified manually per spec acceptance criteria 1–5 for US4.

---

## Phase 7: Polish and Manual Verification Pass

**Purpose**: Cross-cutting concerns, empty states, and a final walkthrough of all acceptance criteria before handoff.

- [x] T069 [P] Add empty-state messages to all listing pages when no ideas match — `MyIdeasPage.tsx`, `AdminDashboard.tsx`
- [x] T070 [P] Add loading spinners / skeleton states to all pages that fetch data — use Tailwind `animate-pulse` or shadcn/ui Skeleton
- [x] T071 [P] Validate all API error responses are surfaced as user-readable toasts or inline messages (never raw JSON) — across all forms and pages
- [x] T072 [P] Ensure all forms reset correctly after successful submission (no stale data on re-open) — `IdeaSubmitForm.tsx`, `EvaluationDialog.tsx`
- [ ] T073 [P] Verify layout does not break below 768 px on all pages — manual browser resize check
- [ ] T074 [P] Ensure no `console.error` or unhandled promise rejections appear in browser DevTools during any manual test flow
- [ ] T075 Manual verification pass: execute every Given/When/Then scenario from `spec.md` US1–US4 and record pass/fail; explicitly time `GET /api/ideas` with 100 seeded rows — must render ≤ 3 s (SC-007); confirm seed password `Admin1234` has been changed on the target environment before sign-off — update spec status to `Verified` when all pass

---

## Task Summary

| Phase                | Tasks                | Scope                                                                         |
| -------------------- | -------------------- | ----------------------------------------------------------------------------- |
| Phase 1 — Setup      | T001–T009            | Project scaffold, config, tooling                                             |
| Phase 2 — Foundation | T010–T027, T076–T078 | EF Core models, JWT, middleware, Axios, AuthContext, constants, rate limiting |
| Phase 3 — US1        | T028–T040            | Register, login, logout, route guards                                         |
| Phase 4 — US2        | T041–T050            | Idea submission + file upload + My Ideas list                                 |
| Phase 5 — US3        | T051–T059            | Evaluation workflow + status machine + detail page                            |
| Phase 6 — US4        | T060–T068            | Paginated listing, search, filters                                            |
| Phase 7 — Polish     | T069–T075            | Empty states, loading, error UX, verification pass                            |
| **Total**            | **78 tasks**         |                                                                               |

