# ADR-0005: UI Component Library – Tailwind CSS + shadcn/ui

## Status

Accepted

## Date

2026-05-14

---

## Context

The InnovatEPAM Portal's React + TypeScript frontend (ADR-0002) requires a consistent, accessible, and maintainable visual design system. The MVP must deliver the following UI surfaces:
- Authentication forms (login, register)
- Idea submission form (title, description, category, file attachment)
- Idea listing table/cards with status badges
- Idea detail view with evaluator comment
- Admin evaluation dashboard with accept/reject dialogs
- Navigation and role-aware layout

Key requirements:
- **Speed:** The MVP timeline demands rapid UI assembly with pre-built, composable components.
- **Accessibility:** Components must be keyboard-navigable and screen-reader friendly (WCAG 2.1 AA target).
- **Customisability:** Components must be easily styled to match EPAM's branding guidelines in future phases.
- **Ownership:** Components should be in the project's own codebase to avoid runtime dependency on a third-party design system's versioning decisions.
- **Bundle size:** Only used styles/components should be included in the production build.

Alternatives considered:

| Option | Pros | Cons |
|---|---|---|
| **Tailwind CSS + shadcn/ui** | Utility-first CSS, zero dead styles (PurgeCSS), shadcn copies components into source (full ownership), Radix UI primitives (accessible) | Tailwind class verbosity; developers need familiarity with utility-first paradigm |
| Material UI (MUI) | Rich component set, well-documented | Opinionated Material Design aesthetic; large bundle; harder to customise deeply |
| Ant Design | Enterprise-focused, comprehensive | Opinionated Chinese enterprise aesthetic; large bundle; limited Tailwind integration |
| Plain CSS Modules | Full control, no dependency | Requires building every component from scratch; slow for MVP |
| Bootstrap | Widely known, quick | jQuery legacy, less modern, limited customisation without overrides |

---

## Decision

We will use **Tailwind CSS v3** for styling combined with **shadcn/ui** as the component library.

### Rationale:
- **Tailwind CSS** generates only the utility classes used in the project (via content scanning), keeping the production CSS bundle minimal. It replaces global stylesheets with predictable, co-located utility classes.
- **shadcn/ui** is not a traditional npm package dependency — it copies component source code directly into the project (`src/components/ui/`). This means:
  - Components are fully owned and version-controlled by the team.
  - No runtime dependency on a third-party library version.
  - Components can be modified freely without forking.
- shadcn/ui is built on **Radix UI primitives**, which provide fully accessible, unstyled interactive components (dialogs, dropdowns, tooltips, etc.) satisfying the accessibility requirement.
- **`class-variance-authority` (cva)** and **`clsx`** are used for conditional and variant-based class composition.

### Component conventions:
- All UI primitives (Button, Input, Badge, Dialog, Select, Table) are sourced from shadcn/ui and live in `src/components/ui/`.
- Feature-level composite components (IdeaCard, StatusBadge, EvaluationDialog) are built in `src/components/` using the UI primitives.
- No inline styles; all styling via Tailwind utility classes.
- A shared `tailwind.config.ts` defines the project's colour palette, typography scale, and spacing tokens.

---

## Consequences

**Positive:**
- Radix UI primitives ensure dialog, dropdown, and form components are accessible by default (keyboard navigation, ARIA attributes, focus management).
- Tailwind's utility-first approach eliminates specificity conflicts and global stylesheet side-effects.
- Components copied into the codebase will never break due to a library upgrade; the team controls when and how they evolve.
- Excellent developer tooling: Tailwind IntelliSense extension for VS Code provides autocompletion for all utility classes.
- Consistent design tokens (colours, spacing) defined once in `tailwind.config.ts` make a future rebrand a single-file change.

**Negative / Trade-offs:**
- Tailwind utility class strings can become long and visually noisy on complex components; mitigated by extracting repeated patterns into `cva` variants.
- New team members unfamiliar with utility-first CSS face a short learning curve.
- shadcn/ui components copied into the project must be manually updated when upstream releases improvements or security patches; the team must track upstream changes.

**Neutral:**
- Dark mode support can be enabled in a future phase with minimal effort via Tailwind's `dark:` variant and a theme toggle.
- shadcn/ui's theming system uses CSS custom properties, making it straightforward to apply EPAM brand colours when required.
