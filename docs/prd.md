# InnovatEPAM Portal – Product Requirements Document (PRD)

## 1. Overview

InnovatEPAM Portal is a digital platform designed for EPAM employees to submit their innovation ideas and for admins/evaluators to review, manage, and track these ideas. The portal streamlines the innovation process, encourages employee participation, and provides transparency in idea evaluation.

## 2. Problem Statement

EPAM currently lacks a centralized, transparent, and efficient system for employees to submit, track, and manage innovation ideas. This results in lost opportunities, inefficient evaluation, and limited engagement from employees.

## 3. Goals

- Enable employees to easily submit innovation ideas with supporting files.
- Provide admins/evaluators with tools to review, evaluate, and manage submissions.
- Ensure transparent status tracking for all submitted ideas.
- Facilitate idea discovery through listing and search features.
- Secure the platform with robust authentication.

## 4. Success Metrics

- Number of ideas submitted per month.
- Average time from submission to evaluation decision.
- User engagement rates (active submitters and evaluators).
- User satisfaction scores (via feedback surveys).
- Percentage of ideas progressing to implementation.

## 5. User Personas

- **Submitter (Employee):** EPAM staff who want to propose new ideas. Needs a simple, guided submission process and visibility into the status of their ideas.
- **AdminEvaluator:** EPAM staff responsible for reviewing, evaluating, and managing submitted ideas. Needs efficient tools for evaluation, communication, and workflow management.

## 6. User Stories

- As a Submitter, I want to log in securely so that my submissions are attributed to me.
- As a Submitter, I want to submit an idea with a description and file attachments so that I can provide supporting materials.
- As a Submitter, I want to track the status of my submitted ideas so that I know their progress.
- As an AdminEvaluator, I want to review and evaluate submitted ideas so that I can select the most promising ones.
- As an AdminEvaluator, I want to update the status of ideas and provide feedback to submitters.
- As any user, I want to search and browse ideas so that I can discover existing submissions.

## 7. Scope

**IN:**

- User authentication
- Idea submission with file attachment
- Idea evaluation workflow (review, status update, feedback)
- Status tracking for submitters
- Idea listing and search

**OUT:**

- Integration with external project management tools
- Automated idea scoring using AI
- Public (non-EPAM) access

## 8. Assumptions

- All users are EPAM employees with valid credentials.
- AdminEvaluator role is assigned by EPAM management.
- The platform will be hosted on EPAM’s internal infrastructure.

## 9. Risks

- Low user adoption due to lack of awareness or engagement.
- Data privacy concerns regarding submitted ideas and attachments.
- Potential delays in evaluation due to limited admin resources.
- Technical challenges in file handling and secure authentication.

## 10. MVP Scope

The MVP (Minimum Viable Product) focuses on Phase 1 core features to establish a working innovation submission and evaluation platform.

**IN SCOPE for MVP:**

- User registration, login, logout
- Role distinction (Submitter vs AdminEvaluator)
- Idea submission form (title, description, category)
- Single file attachment per idea
- Idea listing and viewing
- Status tracking (submitted, under review, accepted, rejected)
- Admin accept/reject with required comment

**OUT OF SCOPE for MVP (Future Phases):**

- Smart submission forms (dynamic fields by category)
- Multiple file attachments
- Draft management
- Multi-stage review
- Blind review
- Scoring system
- Budget allocation
