# ADR-0002: Frontend Framework – React + TypeScript

## Status

Accepted

## Date

2026-05-14

---

## Context

The InnovatEPAM Portal requires a client-side web application that enables:
- Role-aware UI rendering (Submitter vs AdminEvaluator views)
- A multi-field idea submission form with file attachment
- An idea listing and detail view with status indicators
- An admin evaluation dashboard with accept/reject actions

The frontend must consume the ASP.NET Core REST API (ADR-0001) and must be maintainable by a team already familiar with modern JavaScript tooling. The application scope is internal (EPAM employees only), so SEO and public crawlability are not requirements.

Alternatives considered:

| Option | Pros | Cons |
|---|---|---|
| **React + TypeScript** | Dominant ecosystem, strong typing, large community, excellent tooling, flexible | Requires discipline to avoid prop-drilling and over-complexity |
| Angular | Opinionated, enterprise-ready, TypeScript-first | Heavier, longer ramp-up, more boilerplate for MVP scope |
| Vue 3 + TypeScript | Approachable, good DX | Smaller enterprise adoption at EPAM; less team familiarity |
| Plain HTML/JS | Zero overhead | Not maintainable at scale; no component model |

---

## Decision

We will use **React 18 with TypeScript** (bootstrapped via Vite) as the frontend framework.

- **Vite** is used as the build tool for fast development server startup and optimised production builds.
- **React Router v6** handles client-side routing and protected route guards.
- **React Context + hooks** manage authentication state (user, role, token).
- **Axios** is used for HTTP communication with the ASP.NET Core API, with request interceptors to attach JWT tokens.
- All components are written as **functional components with hooks**; class components are prohibited.

---

## Consequences

**Positive:**
- TypeScript catches type mismatches at compile time, reducing integration bugs between frontend and API contracts.
- React's component model enables clean separation between Submitter and AdminEvaluator UI flows.
- Vite provides near-instant hot module replacement (HMR), improving developer experience.
- Wide availability of React developers at EPAM reduces onboarding friction.
- Ecosystem maturity means solutions exist for every MVP requirement (routing, form handling, file uploads).

**Negative / Trade-offs:**
- React alone does not enforce architecture; the team must establish conventions for folder structure and state management to avoid sprawl.
- No server-side rendering (SSR) — acceptable since the portal is internal and SEO is not a requirement.
- TypeScript adds initial setup overhead, but pays off in maintainability across sprints.

**Neutral:**
- If state management grows complex in future phases (e.g., notifications, live status updates), Zustand or Redux Toolkit can be introduced without replacing the React foundation.
