# AGENTS — InnovatEPAM Portal

This file describes how AI agents (GitHub Copilot, Claude, Cursor, etc.) should work on this codebase.  
Read this file before making any changes. Follow every rule here without exception.

---

## First: Read the Constitution

All coding principles for this project are defined in [`constitution.md`](constitution.md).  
Before writing any code, read the relevant sections. Key rules that affect almost every task:

- Controllers are thin — business logic belongs in services.
- DTOs at every API boundary — never expose EF entities directly.
- Every schema change requires a new EF migration — never edit an existing one.
- `dotnet build` must pass before committing any backend change.
- `npx tsc -p tsconfig.app.json --noEmit` must pass before committing any frontend change.

---

## Repository Layout

```
InnovatEpam/
├── backend/InnovatEpam.Api/   ← ASP.NET Core 9 Web API
└── frontend/                  ← React 18 + TypeScript + Vite
constitution.md                ← Coding principles (read first)
README.md                      ← Setup and feature overview
PROJECT_SUMMARY.md             ← Phase completion record
```

---

## Backend Conventions

### Service Layer (required)

Every piece of business logic lives in a service class under `Services/`.  
Controllers call services; services call `AppDbContext`. This chain is never skipped.

```
Controller action
  → calls Service method
    → uses AppDbContext
      → returns (result, error) tuple
```

Return tuples follow this pattern — never throw exceptions for expected business errors:

```csharp
// ✅ correct
public async Task<(IdeaResponse? Response, string? Error)> DoSomethingAsync(...)
{
    if (notFound) return (null, "Idea not found.");
    ...
    return (response, null);
}

// ❌ wrong — do not throw for expected conditions
throw new NotFoundException("Idea not found.");
```

### DTOs

- Request DTOs live in `DTOs/<Feature>/`. Use Data Annotations for validation.
- Response DTOs are plain C# records or classes. Never return EF entities from controllers.
- For ideas, the main response types are `IdeaResponse` (full detail) and `IdeaSummaryResponse` (list item).

### EF Core & Migrations

```bash
# Always run from the project directory
cd InnovatEpam/backend/InnovatEpam.Api

# Add a migration after any model change
dotnet ef migrations add <MigrationName>

# Apply to the local database
dotnet ef database update
```

- Migration names use PascalCase and describe the change: `AddBlindReview`, `AddEvaluationScores`.
- Never edit a migration file that already exists in the repository.
- After adding a migration, verify `dotnet build` still passes.

### Enums

All enums (e.g. `IdeaStatus`, `IdeaCategory`) are stored as strings in the database using `.HasConversion<string>()` in `AppDbContext`. Do not change this to integer storage.

### Auth

- User identity is read via `User.FindFirstValue(ClaimTypes.NameIdentifier)` (returns the userId).
- Role is read via `User.FindFirstValue(ClaimTypes.Role)`.
- Helper methods `GetUserId()` and `GetRole()` are defined on the base controller — use them; do not re-implement claim reading inline.

### Build Check

```bash
cd InnovatEpam/backend/InnovatEpam.Api
dotnet build 2>&1
# Must exit 0 before any commit
```

---

## Frontend Conventions

### Pages vs Components

| Location                 | Rule                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| `src/pages/`             | Route-level components. Own data fetching, top-level state, and layout.          |
| `src/components/`        | Reusable, props-driven. Must not call API services directly.                     |
| `src/components/ui/`     | Primitive UI elements (shadcn/ui wrappers, StarRating, etc.). No business logic. |
| `src/components/ideas/`  | Feature components scoped to the ideas domain.                                   |
| `src/components/forms/`  | Form components. Receive callbacks; do not navigate or fetch independently.      |
| `src/components/layout/` | AppShell, navigation.                                                            |

### API Calls

All HTTP calls go through service modules in `src/services/`. Never use `fetch` or `axios` directly inside a component or page.

```typescript
// ✅ correct
import { ideasApi } from "../services/ideasApi";
const idea = await ideasApi.getIdeaById(id);

// ❌ wrong
const res = await fetch(`/api/ideas/${id}`);
```

### Types

All shared types live in `src/types/index.ts`. When adding a new API response or payload:

1. Add the interface there first.
2. Use it in the service module.
3. Use it in the page/component.

Never use `any`. Use `unknown` for truly unknown shapes and narrow with type guards.

### Tailwind & shadcn/ui

- Use Tailwind utility classes for all layout and spacing.
- Use shadcn/ui components (`Button`, `Dialog`, `Select`, `Label`, `Textarea`, `Table`, etc.) for interactive elements.
- Do not write custom CSS files unless a Tailwind utility genuinely does not exist for the need.

### State Pattern in Pages

```typescript
// Standard pattern for async data in a page
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api
    .getSomething()
    .then(setData)
    .catch(() => setError("Failed to load."))
    .finally(() => setLoading(false));
}, []);
```

Always render a loading state and an error state — never leave the UI blank on failure.

### Type-Check

```bash
cd InnovatEpam/frontend
npx tsc -p tsconfig.app.json --noEmit
# Must produce no output (zero errors) before any commit
```

---

## Making Changes — Step-by-Step

### Adding a backend feature

1. Add or update the model in `Models/`.
2. Add a migration: `dotnet ef migrations add <Name>`.
3. Add/update DTOs in `DTOs/`.
4. Add/update the service method in `Services/`.
5. Add/update the controller action in `Controllers/`.
6. Run `dotnet build` — fix any errors.

### Adding a frontend feature

1. Add/update types in `src/types/index.ts`.
2. Add/update the API service in `src/services/`.
3. Build the component(s) in `src/components/`.
4. Wire up in the page in `src/pages/`.
5. Run `npx tsc -p tsconfig.app.json --noEmit` — fix any errors.

### Fixing a bug

1. Read the relevant files before editing — never guess at current content.
2. Make the minimal change required; do not refactor unrelated code.
3. Run the appropriate build/type check after every edit.
4. Consider whether the same bug pattern exists elsewhere and fix those too.

---

## What NOT to Do

- Do not add business logic to controllers.
- Do not return EF entity objects from controllers.
- Do not edit existing migration files.
- Do not use `any` in TypeScript.
- Do not call the API directly from a component — use a service module.
- Do not commit with a failing build or type-check.
- Do not add comments that merely restate what the code does.
- Do not introduce new dependencies without a clear reason.

---

_Project: InnovatEPAM Portal_
_Author: Bade Balcı_
_Last updated: May 2026_
