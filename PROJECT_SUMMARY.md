# InnovatEPAM Portal - Project Summary

## Overview

InnovatEPAM is a full-stack idea management portal that allows employees to submit, track, and get evaluated on innovation proposals. It supports role-based access for submitters and admin evaluators, a multi-stage review pipeline, anonymous blind review mode, and a structured 5-dimension scoring system.

## Phases Completed

### Phase 1: Core Portal

- [x] User registration with email/password
- [x] User login/logout
- [x] Role-based access (submitter/admin)
- [x] Idea submission form
- [x] Single file attachment
- [x] Idea listing page
- [x] Status tracking
- [x] Admin evaluation workflow

### Phase 2: Smart Submission Forms

- [x] Dynamic form fields by category
- [x] Category-specific guidance

### Phase 3: Multi-Media Support

- [x] Multiple file attachments
- [x] File preview capabilities

### Phase 4: Draft Management

- [x] Save ideas as drafts
- [x] Edit drafts before submission

### Phase 5: Multi-Stage Review

- [x] Configurable evaluation stages
- [x] Stage-specific actions

### Phase 6: Blind Review

- [x] Anonymous evaluation mode
- [x] Identity reveal after decision

### Phase 7: Scoring System

- [x] Multi-dimension scoring
- [x] Score aggregation and ranking

## Technical Decisions

### Technology Stack

- **Framework:** ASP.NET Core 9 (Web API) + React 18 + Vite
- **UI:** React + Tailwind CSS + shadcn/ui
- **Storage:** SQLite via Entity Framework Core 9
- **Key Libraries:** BCrypt.Net-Next (password hashing), JWT Bearer (auth), React Router v6, Axios

### Key Architecture Decisions

**Service layer pattern:** All business logic lives in dedicated service classes (`IdeaService`, `EvaluationService`, `SettingsService`) rather than directly in controllers, keeping controllers thin and logic testable.

**String-converted enums in EF Core:** Idea statuses and categories are stored as strings in the database rather than integers, making the database human-readable and resilient to enum reordering across migrations.

## Challenges & Solutions

### Challenge 1: Multi-file attachments broken by UNIQUE constraint

Adding support for multiple attachments per idea failed at runtime because the initial EF migration had created a UNIQUE constraint on `Attachments.IdeaId`, limiting each idea to one attachment.

**Solution:** Created a targeted EF migration (`AllowMultipleAttachments`) that explicitly dropped the unique index from the `Attachments` table, allowing many attachments per idea without touching the rest of the schema.

### Challenge 2: Draft ideas incorrectly displaying as "Submitted"

Ideas saved as drafts were appearing in the list with "Submitted" status because the frontend form was sending the field name `"saveDraft"` but the backend DTO expected `"saveAsDraft"`.

**Solution:** Fixed the form field name in `IdeaSubmitForm.tsx` to match the backend DTO property name exactly (`saveAsDraft`).

## AI Collaboration

### Tools Used

- GitHub Copilot (VS Code agent mode)

### What Worked Well

AI significantly accelerated scaffolding of repetitive patterns — DTOs, EF migrations, React page components, and Tailwind UI layouts were generated quickly and accurately, leaving more time to focus on business logic and edge cases.

### What Could Be Improved

Context window limits required re-summarising progress mid-session, and occasionally the AI would reference stale code it had previously seen rather than the latest state of the file. Explicitly reading files before editing would have prevented some duplicate-code bugs.

## Time Breakdown

| Phase                           | Actual  |
| ------------------------------- | ------- |
| Setup & SpecKit                 | ~1 h    |
| Phase 1: Core Portal            | ~3 h    |
| Phase 2: Smart Submission Forms | ~1 h    |
| Phase 3: Multi-Media Support    | ~1 h    |
| Phase 4: Draft Management       | ~30 min |
| Phase 5: Multi-Stage Review     | ~2 h    |
| Phase 6: Blind Review           | ~1.5 h  |
| Phase 7: Scoring System         | ~2 h    |
| Documentation                   | ~30 min |

## Reflection

### Key Learning

Writing a specification before touching code (SpecKit) forces you to think through data models, edge cases, and API contracts upfront — problems that are cheap to fix in a markdown file are expensive to fix mid-migration.

### What I'd Do Differently

I would define stricter DTO validation rules (e.g., score range constraints, enum string values) at the very start so they flow consistently from the API contract through to the frontend types, rather than tightening them phase by phase.

### SDD vs Vibe Coding

Having a spec kept every AI prompt grounded — instead of asking "build me something cool", each prompt referenced a specific story or acceptance criterion. This made the generated code far more targeted and reduced the number of throwaway iterations.

### AI Collaboration Insight

The most surprising aspect was how well the AI maintained architectural consistency across phases — it remembered the service-layer pattern, naming conventions, and DTO shapes from Phase 1 and applied them correctly in Phase 7 without being reminded, as long as the relevant files were in context.

---

_Submitted by: Bade Balcı_
_Date: May 14, 2026_
_A201 Cohort: May 2026_
