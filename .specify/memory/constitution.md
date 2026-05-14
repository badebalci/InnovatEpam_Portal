# InnovatEPAM Portal Constitution

## Core Principles

### I. Clean Code

Every line written must be immediately understandable by any team member without additional explanation.

- **Single Responsibility.** Every function, method, and class does one thing. If "and" is needed to describe it, split it.
- **Intention-revealing names.** Variables, functions, and files use clear, descriptive names. No unexplained abbreviations.
- **No dead code.** Commented-out code, unused imports, and orphaned files are not permitted in the codebase.
- **Small units.** Functions and components stay within ~50 lines. Anything larger must be decomposed.
- **Flat over nested.** Use early returns and guard clauses instead of deeply nested conditionals.
- **No magic values.** All constants are named and centralised in a dedicated constants file — no hard-coded strings or numbers inline.
- **Readability over cleverness.** If a line needs a comment to explain what it does, rewrite the line.

### II. Simple and Responsive UI/UX

Every screen exists to serve the user's task — not to showcase technology or visual complexity.

- **One primary action per screen.** Users must never wonder what to do next.
- **No decoration without purpose.** Visual elements must communicate information or guide interaction; purely aesthetic additions are not permitted.
- **Consistent patterns.** The same layout, component, and interaction model is used for the same type of action across the entire application. The same problem is never solved differently in two places.
- **Immediate, informative feedback.** Every user action (submit, accept, reject, upload) produces visible feedback — success confirmation, clear error message, or loading indicator.
- **Human-readable errors.** Technical details (stack traces, error codes, SQL messages) must never be exposed to users. Error messages state what went wrong and, where possible, how to fix it.
- **Responsive by default.** All pages must be functional and usable across common screen sizes. Layouts must not break below 768 px. Full mobile optimisation is deferred to a future phase.

### III. Minimal Dependencies (NON-NEGOTIABLE)

Every dependency is a long-term maintenance liability. It must earn its place.

- **Justify before adding.** Before installing any package, ask: can this be implemented in ≤20 lines without a library? If yes, do not add the dependency.
- **No capability duplication.** If the stack already provides a capability (e.g., Axios for HTTP, EF Core for data access), a second library solving the same problem is not permitted.
- **Evaluate health before adopting.** Any new dependency must be actively maintained (last release within 12 months), carry no critical CVEs, and have a compatible licence.
- **Shallow dependency tree.** Prefer packages with few transitive dependencies to keep the build surface manageable.
- **Document every addition.** Every new dependency requires a note in the relevant ADR or PR description explaining the rationale.

## Mandatory Stack

The following technology choices are fixed for the MVP. Substitutions require a new ADR and explicit team agreement before any implementation begins.

| Layer          | Technology                      | Version                       |
| -------------- | ------------------------------- | ----------------------------- |
| Backend API    | ASP.NET Core Web API            | .NET 8                        |
| Frontend       | React + TypeScript              | React 18, TypeScript 5        |
| Build tool     | Vite                            | Latest stable                 |
| Styling        | Tailwind CSS                    | v3                            |
| UI Components  | shadcn/ui (Radix UI primitives) | Latest stable at project init |
| Database       | SQLite                          | —                             |
| ORM            | Entity Framework Core           | EF Core 8                     |
| Authentication | JWT Bearer + Refresh Tokens     | —                             |
| HTTP client    | Axios                           | Latest stable                 |
| Routing        | React Router                    | v6                            |

**Constraints:**

- **No framework substitutions.** React, ASP.NET Core, Tailwind CSS, shadcn/ui, SQLite, and JWT are the designated tools. Replacing any of them requires a formal ADR.
- **No parallel CSS or component libraries.** Tailwind CSS is the sole styling tool. shadcn/ui is the sole source of UI primitives. Bootstrap, MUI, Ant Design, and similar libraries are prohibited.
- **No additional ORMs.** All database access goes through Entity Framework Core. Raw ADO.NET and Dapper are not permitted.
- **Tailwind config is the single source of design tokens.** Colours, spacing, and typography are defined in `tailwind.config.ts`. Hard-coded hex or pixel values are prohibited outside the config file.

## Testing Strategy

The MVP phase uses **manual verification only**. No automated test infrastructure (unit tests, integration tests, E2E tests) is required or permitted to block delivery.

**Definition of Done — a story is complete when:**

1. The feature is implemented and running in the local development environment.
2. All Given/When/Then acceptance criteria from `stories.md` have been manually executed and pass.
3. At least one other team member has reviewed the feature.
4. No console errors or unhandled exceptions occur during manual walkthrough.
5. The feature behaves correctly under both the Submitter and AdminEvaluator roles where applicable.

**Manual verification checklist per feature:**

- [ ] Happy path — the primary user flow completes successfully end-to-end.
- [ ] Validation — empty or invalid inputs are rejected with clear, user-friendly error messages.
- [ ] Role enforcement — features restricted to a role are inaccessible to other roles.
- [ ] Authentication boundary — protected pages and API endpoints reject unauthenticated access.
- [ ] Edge cases — story-specific boundary conditions (e.g., oversized file, duplicate email) behave as specified.

**Testability requirement (non-optional even without automated tests):**
Business logic must reside in service classes — not in controllers or React components. Side effects (database, file I/O, HTTP) must be injected as dependencies. This ensures the codebase can adopt automated testing in future phases without structural refactoring.

## Out of Scope for MVP

The following features are explicitly excluded from Phase 1. No implementation work may begin on these items until the MVP is delivered and a new phase is formally scoped.

| Feature                                      | Reason deferred                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Draft management**                         | Adds submission state complexity not required for core flow                          |
| **Multi-stage review**                       | MVP uses a single accept/reject decision; pipeline stages are Phase 2                |
| **Blind review**                             | Hiding submitter identity adds data model complexity                                 |
| **Scoring / rating system**                  | Quantitative evaluation beyond accept/reject is out of MVP scope                     |
| **Multiple file attachments**                | Single attachment covers MVP needs; multi-file adds upload UX and storage complexity |
| **Smart / dynamic submission forms**         | Category-dependent dynamic fields require a form schema engine                       |
| **Budget allocation**                        | Financial workflows deferred until portal adoption is proven                         |
| **Email / push notifications**               | Desirable but not critical for MVP                                                   |
| **EPAM SSO / SAML integration**              | External identity provider integration deferred; JWT covers MVP                      |
| **Idea versioning / edit history**           | Immutable submissions sufficient for MVP; audit trails are Phase 2                   |
| **AI-assisted idea scoring**                 | Explicitly excluded per PRD §7                                                       |
| **Public (non-EPAM) access**                 | Internal-only portal per PRD §7                                                      |
| **External project management integrations** | Explicitly excluded per PRD §7                                                       |

Any team member who believes an out-of-scope item is critical for MVP delivery must raise a formal scope change request with the product owner. Silent implementation is prohibited.

## Governance

- This constitution supersedes all other practices, conventions, and preferences for the duration of the InnovatEPAM Portal project.
- All pull requests must include a constitution compliance check: does the change introduce a prohibited dependency, violate a principle, or implement an out-of-scope feature?
- Amendments to this document require written justification, team agreement, and a corresponding ADR where the change affects the mandatory stack.
- Complexity must be justified against the principles above. When in doubt, choose the simpler option.
- Refer to `docs/adr/` for the rationale behind each mandatory technology choice.

**Version**: 1.0.0 | **Ratified**: 2026-05-14 | **Last Amended**: 2026-05-14
