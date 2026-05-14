# Phase 0 Research: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14

---

## Purpose

Validate that the chosen stack satisfies all functional requirements before committing to the Phase 1 design. Document key technical decisions and any integration concerns discovered during research.

---

## Stack Compatibility Matrix

| Requirement                     | Technology                                               | Compatibility | Notes                                                                          |
| ------------------------------- | -------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| REST API                        | ASP.NET Core 8 Web API                                   | ✅            | Attribute routing, built-in DI, middleware pipeline                            |
| JWT auth + role claims          | `Microsoft.AspNetCore.Authentication.JwtBearer`          | ✅            | Built-in; `[Authorize(Roles="AdminEvaluator")]` attribute works out of the box |
| Refresh token (HttpOnly cookie) | ASP.NET Core cookie response + EF Core storage           | ✅            | Manual implementation; no third-party library needed                           |
| Password hashing                | `BCrypt.Net-Next`                                        | ✅            | 1 package; lightweight; no BCrypt implementation needed in-house               |
| SQLite + ORM                    | EF Core 8 + `Microsoft.EntityFrameworkCore.Sqlite`       | ✅            | Code-first migrations, LINQ queries, seeding API all supported                 |
| File upload (≤ 10 MB)           | ASP.NET Core `IFormFile`                                 | ✅            | Built-in; `RequestSizeLimitAttribute` enforces the cap                         |
| File storage                    | Local file system (`IWebHostEnvironment.WebRootPath`)    | ✅            | `Path.Combine` + `File.WriteAllBytesAsync`; no cloud SDK needed                |
| MIME type validation            | Manual MIME check on `IFormFile.ContentType` + extension | ✅            | No library required; check against whitelist                                   |
| React 18 SPA                    | Vite + `react`, `react-dom`, `react-router-dom`          | ✅            | Standard setup; HMR, code splitting, tree shaking                              |
| TypeScript 5                    | Vite TypeScript template                                 | ✅            | `tsconfig.json` strict mode; full type safety                                  |
| Tailwind CSS v3                 | `tailwindcss` PostCSS plugin                             | ✅            | `tailwind.config.ts` content scanning; zero dead CSS                           |
| shadcn/ui                       | CLI: `npx shadcn-ui@latest init`                         | ✅            | Copies components to `src/components/ui/`; Radix UI primitives                 |
| Axios + JWT interceptor         | `axios` + request interceptor for `Authorization` header | ✅            | Standard pattern; token stored in memory only                                  |
| Pagination                      | EF Core `.Skip().Take()` + React pagination component    | ✅            | Page size 20; no library needed                                                |
| CORS                            | ASP.NET Core `UseCors` middleware                        | ✅            | Allow frontend dev origin (`http://localhost:5173`) in development             |

---

## Key Integration Points

### 1. JWT Token Flow

```
[React] POST /api/auth/login
  → [API] validate credentials
  → [API] return { accessToken } in body + Set-Cookie: refreshToken (HttpOnly, Secure, SameSite=Strict)
  → [React] store accessToken in memory (AuthContext state)
  → [React] Axios interceptor attaches: Authorization: Bearer <accessToken>

On 401 (expired access token):
  → [React] Axios interceptor calls POST /api/auth/refresh (cookie sent automatically)
  → [API] validates refresh token, issues new accessToken
  → [React] retries original request with new token
```

### 2. File Upload Flow

```
[React] IdeaSubmitForm: FormData with { title, description, category, file? }
  → POST /api/ideas  (multipart/form-data)
  → [API] IdeaService.CreateAsync: saves Idea entity, then calls FileStorageService
  → [API] FileStorageService: validates MIME + size, writes to /uploads/{ideaId}/{safeFileName}
  → [API] saves Attachment entity with StoragePath
  → GET /api/ideas/{id}/attachment → FileResult from disk
```

### 3. Role-Scoped Listing

```
GET /api/ideas?page=1&pageSize=20&search=...&category=...&status=...
  → [API] IdeaService reads role from JWT claim
  → Submitter:       WHERE SubmitterId = currentUserId
  → AdminEvaluator:  no SubmitterId filter
  → Apply search/category/status filters on top
  → Return paginated result: { items, totalCount, page, pageSize }
```

### 4. Enforced Status Transition

```
Status machine (server-side guard in EvaluationService):
  submitted      → under_review   (AdminEvaluator: PATCH /api/ideas/{id}/review)
  under_review   → accepted       (AdminEvaluator: POST  /api/ideas/{id}/evaluate { decision: "accepted", comment })
  under_review   → rejected       (AdminEvaluator: POST  /api/ideas/{id}/evaluate { decision: "rejected", comment })
  accepted       → (terminal)
  rejected       → (terminal)

Any attempt to skip a step returns HTTP 409 Conflict.
```

---

## Risk Register

| Risk                                                                | Likelihood | Impact | Mitigation                                                                         |
| ------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------- |
| SQLite write contention (two AdminEvaluators decide simultaneously) | Low        | Medium | First-write-wins accepted; EF Core SaveChanges uses SQLite serialised writes       |
| JWT secret leaked via source control                                | Medium     | High   | Store in `appsettings.Development.json` (git-ignored) and env var in production    |
| File path traversal attack                                          | Low        | High   | Sanitise filename with `Path.GetFileName()`; never use raw user-provided path      |
| CORS misconfiguration exposing API                                  | Low        | Medium | Explicitly enumerate allowed origins; never use wildcard `*` in production         |
| Refresh token theft via XSS                                         | Low        | High   | Refresh token in HttpOnly cookie; access token in memory only (never localStorage) |

---

## Decisions Made During Research

| Decision                                                                   | Rationale                                                                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Use `BCrypt.Net-Next` for password hashing                                 | Industry standard; `BCryptPasswordHasher` in ASP.NET Identity is equivalent but requires full Identity stack; standalone BCrypt is simpler |
| Store access token in React memory (not localStorage)                      | Eliminates XSS token theft vector; token lives only in AuthContext                                                                         |
| Use `IFormFile` with manual MIME whitelist                                 | Built-in; no third-party file-upload library needed                                                                                        |
| Return paginated envelope `{ items, totalCount, page, pageSize }`          | Standard REST pattern; frontend can display "Page 1 of N" without extra requests                                                           |
| Seed AdminEvaluator via `DbContext.Database.EnsureCreated()` + `Seeder.cs` | Runs once on app start; idempotent (checks if seed user exists before inserting)                                                           |

---

## Phase 0 Conclusion

No blocking unknowns. All functional requirements map directly to supported capabilities in the chosen stack. Ready to proceed to Phase 1 design (data model + API contracts).
