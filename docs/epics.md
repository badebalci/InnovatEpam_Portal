# InnovatEPAM Portal – Epics

## EP-001: User Authentication

**Description:**
Implement secure authentication for all users, ensuring only EPAM employees can access the portal and their roles are correctly assigned.

**User Value:**
Ensures data security and personalized access to features based on user roles.

**Workflow:**

- User navigates to the portal
- User logs in with EPAM credentials
- System verifies credentials and assigns role (Submitter or AdminEvaluator)
- User is granted access to appropriate features

**Acceptance Criteria:**

- Only EPAM employees can log in
- Roles are correctly assigned upon login
- Unauthenticated users cannot access protected features

**User Stories:**

- As a Submitter, I want to log in securely so that my submissions are attributed to me.

---

## EP-002: Idea Submission

**Description:**
Allow employees to submit innovation ideas with descriptions and file attachments.

**User Value:**
Empowers employees to easily share and document their innovative ideas.

**Workflow:**

- Submitter logs in
- Navigates to idea submission form
- Fills in idea details and attaches files
- Submits the idea
- Receives confirmation and can view submission status

**Acceptance Criteria:**

- Submitters can submit ideas with descriptions and file attachments
- Submissions are saved and visible to the submitter
- Confirmation is provided upon successful submission

**User Stories:**

- As a Submitter, I want to submit an idea with a description and file attachments so that I can provide supporting materials.

---

## EP-003: Idea Evaluation Workflow

**Description:**
Provide admins/evaluators with tools to review, evaluate, update status, and give feedback on submitted ideas.

**User Value:**
Ensures submitted ideas are efficiently reviewed and evaluated, with clear feedback to submitters.

**Workflow:**

- AdminEvaluator logs in
- Views list of submitted ideas
- Reviews idea details and attachments
- Updates status (e.g., Under Review, Approved, Rejected)
- Provides feedback to submitter

**Acceptance Criteria:**

- AdminEvaluators can view and evaluate all submitted ideas
- Status updates and feedback are visible to submitters
- Evaluation actions are logged

**User Stories:**

- As an AdminEvaluator, I want to review and evaluate submitted ideas so that I can select the most promising ones.
- As an AdminEvaluator, I want to update the status of ideas and provide feedback to submitters.

---

## EP-004: Status Tracking

**Description:**
Enable submitters to track the status and feedback of their submitted ideas throughout the evaluation process.

**User Value:**
Provides transparency and keeps submitters informed about the progress of their ideas.

**Workflow:**

- Submitter logs in
- Views list of their submitted ideas
- Sees current status and feedback for each idea

**Acceptance Criteria:**

- Submitters can view the status and feedback of all their submissions
- Status updates are reflected in real time

**User Stories:**

- As a Submitter, I want to track the status of my submitted ideas so that I know their progress.

---

## EP-005: Idea Listing and Search

**Description:**
Allow users to browse and search submitted ideas to discover existing innovations and avoid duplicates.

**User Value:**
Facilitates idea discovery, collaboration, and reduces redundant submissions.

**Workflow:**

- User logs in
- Navigates to idea listing/search page
- Uses filters or search to find ideas
- Views idea details

**Acceptance Criteria:**

- Users can search and filter ideas
- Idea details are accessible from the listing

**User Stories:**

- As any user, I want to search and browse ideas so that I can discover existing submissions.
