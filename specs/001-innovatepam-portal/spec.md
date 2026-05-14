# Feature Specification: InnovatEPAM Portal

**Feature Branch**: `001-innovatepam-portal`

**Created**: 2026-05-14

**Status**: Clarified

**Input**: User description: "InnovatEPAM Portal is a comprehensive digital platform designed to streamline the innovation process within EPAM, enabling employees to submit creative ideas, facilitating expert evaluation, and managing the implementation of top-tier innovations with dedicated budget allocation."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 – Secure Registration and Login (Priority: P1)

An EPAM employee visits the portal for the first time, creates an account with their EPAM email and a password, then logs in. The system assigns them the Submitter role by default. An AdminEvaluator account is created by EPAM management. Both roles see a dashboard appropriate to their permissions immediately after login. Users can log out and are prevented from accessing any protected page without a valid session.

**Why this priority**: Authentication is the gateway to every other feature. Nothing else can be demonstrated or tested without a working login. It is the foundational slice of the entire platform.

**Independent Test**: Can be fully tested by registering a Submitter account, logging in, verifying the Submitter dashboard is shown, then logging out and confirming the dashboard is inaccessible — entirely without any idea submission or evaluation feature being present.

**Acceptance Scenarios**:

1. **Given** an unregistered user on the registration page, **When** they submit a valid `@epam.com` email, full name, and a password meeting the policy (min 8 chars, 1 uppercase, 1 number), **Then** their account is created with the Submitter role and they are redirected to the login page with a success message.
2. **Given** a registered user on the login page, **When** they submit valid credentials, **Then** they are authenticated, a JWT is issued, and they are redirected to their role-appropriate dashboard.
3. **Given** a registered user attempts to log in with an incorrect password, **When** the form is submitted, **Then** a generic error ("Invalid email or password") is shown and no session is created.
4. **Given** a logged-in user clicks "Logout", **When** the action completes, **Then** the session token is invalidated and they are redirected to the login page.
5. **Given** an unauthenticated user attempts to navigate directly to a protected route, **When** the page loads, **Then** they are redirected to the login page and no protected content is visible.
6. **Given** a Submitter is logged in, **When** they attempt to access an AdminEvaluator-only page via direct URL, **Then** they receive an "Access Denied" message and cannot view the content.

---

### User Story 2 – Idea Submission with File Attachment (Priority: P1)

A logged-in Submitter navigates to the idea submission form, fills in a title, description, and category, optionally attaches a single supporting file, and submits. They receive a confirmation with a reference number and the idea appears in their "My Ideas" list with status "submitted". An AdminEvaluator can immediately see the new idea in the evaluation dashboard.

**Why this priority**: Idea submission is the core value proposition for Submitters. Without it, the portal has no content to evaluate and delivers no value to the primary user group.

**Independent Test**: Can be fully tested by submitting an idea with and without a file attachment, verifying the confirmation message, and checking "My Ideas" shows the submission with status "submitted" — without any evaluation feature needing to exist.

**Acceptance Scenarios**:

1. **Given** a logged-in Submitter on the submission form, **When** they fill in title, description, and category then click "Submit", **Then** the idea is saved with status "submitted", a confirmation with a reference number is shown, and the idea appears in "My Ideas".
2. **Given** a Submitter attaches a valid file (PDF, DOCX, PNG ≤ 10 MB) to their submission, **When** the form is submitted, **Then** the file is linked to the idea and its name is shown on the idea detail page.
3. **Given** a Submitter attaches a file that exceeds 10 MB or has an unsupported type, **When** the file is selected, **Then** a clear error is shown and the file is not attached.
4. **Given** a Submitter submits the form with a required field left blank, **When** the form is validated, **Then** inline errors highlight the empty fields and the submission is not processed.
5. **Given** a submission succeeds, **When** an AdminEvaluator views the evaluation dashboard, **Then** the new idea is visible with status "submitted" and the attachment (if any) is downloadable.

---

### User Story 3 – Admin Evaluation and Status Decision (Priority: P1)

A logged-in AdminEvaluator opens the evaluation dashboard, selects a submitted idea, marks it as "under review", reads the details and attachment, then either accepts or rejects it with a mandatory comment. The Submitter's "My Ideas" view reflects the updated status and displays the evaluator's comment on the idea detail page.

**Why this priority**: Evaluation closes the loop on the innovation workflow. Without it, submissions accumulate with no outcome — the portal fails its core purpose of selecting promising ideas.

**Independent Test**: Can be fully tested (assuming Story 2 is complete) by marking an idea as "under review", then accepting it with a comment, and verifying the Submitter sees "accepted" and the comment — without any search or notification feature present.

**Acceptance Scenarios**:

1. **Given** a logged-in AdminEvaluator on the evaluation dashboard, **When** they click "Start Review" on a "submitted" idea, **Then** the status changes to "under review" and the Submitter's view reflects this.
2. **Given** an AdminEvaluator reviewing an idea with status "under review", **When** they click "Accept", enter a comment, and confirm, **Then** the status changes to "accepted", the comment is saved, and the action is logged with the evaluator's name and timestamp.
3. **Given** an AdminEvaluator clicks "Accept" but leaves the comment field empty, **When** they attempt to confirm, **Then** a validation error ("A comment is required") is shown and the status does not change.
4. **Given** an AdminEvaluator reviewing an idea, **When** they click "Reject", enter a comment, and confirm, **Then** the status changes to "rejected" and the comment is visible to the Submitter.
5. **Given** an idea has been accepted or rejected, **When** the Submitter opens that idea's detail page, **Then** the final status and the evaluator's comment are clearly displayed.

---

### User Story 4 – Idea Listing, Search, and Filtering (Priority: P2)

Any logged-in user can navigate to the ideas listing page, browse all submitted ideas, search by keyword, and filter by category or status. Clicking an idea opens its detail view showing the full content, status, and attachment link.

**Why this priority**: Discovery and deduplication are valuable but not blocking for core MVP functionality. Stories 1–3 deliver a complete end-to-end workflow without this feature.

**Independent Test**: Can be fully tested independently by browsing all ideas, performing a keyword search, applying a category filter, and verifying the detail page loads — without any evaluation action being taken.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the idea listing page, **When** the page loads, **Then** all submitted ideas are shown with title, category, submitter name, submission date, and current status.
2. **Given** a user types a keyword into the search bar and submits, **When** the results update, **Then** only ideas whose title or description contains the keyword are shown, with a result count displayed.
3. **Given** a user selects a category from the filter dropdown, **When** the filter is applied, **Then** only ideas in that category are listed and the active filter is visually indicated.
4. **Given** a user clicks on any idea in the listing, **When** the detail page loads, **Then** the full title, description, category, status, evaluator comment (if any), and attachment link (if any) are visible.
5. **Given** a search or filter returns no results, **When** the list updates, **Then** an empty-state message is shown with a suggestion to clear the filter.

---

### Edge Cases

- What happens when a user registers with an email address already associated with an existing account?
- What happens when a file attachment exceeds the allowed size or uses an unsupported MIME type?
- What happens when an AdminEvaluator attempts to accept or reject an idea without entering a comment?
- What happens when a Submitter navigates directly to the AdminEvaluator evaluation URL?
- What happens when the idea listing is empty (no submissions yet)?
- What happens when a user's JWT access token expires mid-session while they are filling in the submission form?
- What happens when the same idea is opened by two AdminEvaluators simultaneously and both attempt to submit a decision?
- What happens when the uploaded file cannot be read or is corrupted on the server side?

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow EPAM employees to register an account using a valid `@epam.com` email address, full name, and password. Emails from any other domain MUST be rejected with a clear validation message.
- **FR-002**: System MUST authenticate users via email and password and issue a signed JWT access token upon successful login.
- **FR-003**: System MUST enforce two distinct roles — `Submitter` and `AdminEvaluator` — with role-appropriate access to features and API endpoints.
- **FR-004**: System MUST allow Submitters to submit an idea with a title, description, and category (all required). Category MUST be selected from a fixed predefined list: Technology, Process, Product, People, Other.
- **FR-005**: System MUST allow a single file attachment per idea submission (supported types: PDF, DOCX, PNG, JPG; max size: 10 MB).
- **FR-006**: System MUST maintain a four-state status lifecycle for ideas: `submitted` → `under review` → `accepted` | `rejected`. The transition to `accepted` or `rejected` is only permitted from `under review`; direct transition from `submitted` is blocked.
- **FR-007**: System MUST require AdminEvaluators to provide a non-empty comment when accepting or rejecting an idea; the decision must be blocked if the comment is absent.
- **FR-008**: System MUST display the evaluator's comment alongside the idea status to the Submitter on the idea detail page.
- **FR-009**: System MUST scope the idea listing by role: Submitters see only their own ideas; AdminEvaluators see all ideas. The listing is paginated with a default page size of 20.
- **FR-010**: System MUST allow users to search ideas by keyword matching title or description, within their visible scope.
- **FR-011**: System MUST allow users to filter ideas by category (Technology, Process, Product, People, Other) and by status, within their visible scope.
- **FR-012**: System MUST log all evaluation actions (accept/reject) with the evaluator's identity and a timestamp.
- **FR-013**: System MUST reject unauthenticated requests to all protected endpoints with HTTP 401.
- **FR-014**: System MUST reject requests from a role without permission to a restricted endpoint with HTTP 403.
- **FR-015**: System MUST validate all form inputs server-side regardless of client-side validation.
- **FR-016**: System MUST enforce a password policy of minimum 8 characters with at least one uppercase letter and one number, validated on both client and server.
- **FR-017**: System MUST seed a default AdminEvaluator account on first run via a database seed script, providing the bootstrap account for EPAM management.

### Key Entities

- **User**: Represents an EPAM employee. Key attributes: unique ID, EPAM email, hashed password, full name, role (`Submitter` | `AdminEvaluator`), registration timestamp.
- **Idea**: Represents a submitted innovation proposal. Key attributes: unique ID, title, description, category, status (`submitted` | `under review` | `accepted` | `rejected`), reference to submitter (User), submission timestamp, last updated timestamp.
- **Attachment**: Represents a file linked to an idea. Key attributes: unique ID, reference to idea, original filename, server-side storage path, upload timestamp. An idea has zero or one attachment.
- **Evaluation**: Represents an accept/reject decision on an idea. Key attributes: unique ID, reference to idea, reference to evaluator (User), decision (`accepted` | `rejected`), mandatory comment text, decision timestamp.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can complete registration and log in within 2 minutes on first visit.
- **SC-002**: A Submitter can complete the full idea submission flow (fill form + attach file + submit) in under 3 minutes.
- **SC-003**: An AdminEvaluator can open an idea, read the details, and submit an accept/reject decision with a comment in under 2 minutes.
- **SC-004**: Status changes made by an AdminEvaluator are visible to the Submitter on their next page load (no stale cache).
- **SC-005**: All protected API endpoints return HTTP 401 for requests without a valid JWT and HTTP 403 for requests from an insufficient role — verified manually for every endpoint.
- **SC-006**: An uploaded file is retrievable and downloadable by an AdminEvaluator from the idea detail page without corruption.
- **SC-007**: The idea listing page renders within 3 seconds for up to 100 submitted ideas on the target hosting environment.

---

## Assumptions

- Registration is restricted to `@epam.com` email addresses. Any email not ending in `@epam.com` is rejected at the registration form and server-side validator.
- Categories on the submission form are a fixed predefined list: **Technology, Process, Product, People, Other**. No dynamic category management is required for the MVP.
- The status transition `submitted → under review → accepted | rejected` is strictly enforced. An AdminEvaluator cannot accept or reject an idea that has not first been moved to "under review".
- Submitters can browse and search **only their own ideas**. AdminEvaluators can view all ideas. The listing page is scoped by role.
- A default AdminEvaluator account is created by a **database seed script** that runs on first launch. This seed account is the bootstrap entry point for EPAM management.
- Password policy: minimum 8 characters, at least one uppercase letter, at least one number. Enforced on both client and server.
- The idea listing page defaults to **20 ideas per page**. Pagination controls allow navigating forward and backward.
- Only one file attachment per idea is supported in the MVP; multiple attachments are deferred to Phase 2.
- No email or push notifications are sent for status changes in the MVP; Submitters check their status manually.
- The portal is hosted on EPAM's internal infrastructure with HTTPS enforced; HTTP requests are redirected.
- Browser support targets modern evergreen browsers (Chrome, Firefox, Edge); Internet Explorer is explicitly not supported.
- Concurrent write conflicts (two AdminEvaluators deciding the same idea simultaneously) are resolved by first-write-wins at the database level; no optimistic locking UI is required for the MVP.
- File storage uses the server's local file system for the MVP; cloud/object storage is a Phase 2 concern.
