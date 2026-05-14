# InnovatEPAM Portal – User Stories

> Stories follow the INVEST criteria: **Independent**, **Negotiable**, **Valuable**, **Estimable**, **Small**, **Testable**.
> Status values: `submitted` · `under review` · `accepted` · `rejected`
> Priority: **P1** = Must Have (MVP) · **P2** = Should Have · **P3** = Nice to Have (Future)

---

## EP-001: User Authentication

---

### US-001 – User Registration

| Field    | Value  |
| -------- | ------ |
| Story ID | US-001 |
| Epic     | EP-001 |
| Priority | P1     |

**Story:**
As an EPAM employee, I want to register an account on the portal, so that I can access the platform and submit innovation ideas.

**Acceptance Criteria:**

```
Given I am an EPAM employee visiting the portal for the first time
When I fill in the registration form with a valid EPAM email, full name, and password
Then my account is created with the default role of Submitter
  And I am redirected to the login page with a success message

Given I attempt to register with an email that already exists
When I submit the registration form
Then I see a clear error message stating the email is already in use
  And my account is not duplicated

Given I submit the registration form with an invalid or non-EPAM email
When the form is validated
Then I see an inline validation error
  And the form is not submitted
```

---

### US-002 – User Login

| Field    | Value  |
| -------- | ------ |
| Story ID | US-002 |
| Epic     | EP-001 |
| Priority | P1     |

**Story:**
As a registered user, I want to log in with my EPAM credentials, so that my session is authenticated and my submissions are attributed to me.

**Acceptance Criteria:**

```
Given I am a registered user on the login page
When I enter valid credentials and click "Login"
Then I am authenticated and redirected to my role-appropriate dashboard
  And a secure session token is issued

Given I enter incorrect credentials
When I submit the login form
Then I see a generic error message ("Invalid email or password")
  And I remain on the login page
  And no session is created

Given I am already logged in and try to access the login page
When the page loads
Then I am automatically redirected to my dashboard
```

---

### US-003 – User Logout

| Field    | Value  |
| -------- | ------ |
| Story ID | US-003 |
| Epic     | EP-001 |
| Priority | P1     |

**Story:**
As an authenticated user, I want to log out of the portal, so that my session is terminated and my account is protected on shared devices.

**Acceptance Criteria:**

```
Given I am logged in and viewing any page
When I click the "Logout" button
Then my session token is invalidated
  And I am redirected to the login page

Given I have logged out
When I attempt to navigate to a protected page via direct URL
Then I am redirected to the login page
  And no protected content is visible
```

---

### US-004 – Role-Based Access Control

| Field    | Value  |
| -------- | ------ |
| Story ID | US-004 |
| Epic     | EP-001 |
| Priority | P1     |

**Story:**
As the system, I want to enforce role-based access control, so that Submitters and AdminEvaluators only access features appropriate to their role.

**Acceptance Criteria:**

```
Given a user is logged in as a Submitter
When they attempt to access AdminEvaluator-only pages (e.g., evaluation dashboard)
Then they receive a 403 Forbidden response
  And they are shown an "Access Denied" message

Given a user is logged in as an AdminEvaluator
When they navigate to the admin evaluation dashboard
Then they can view and act on all submitted ideas

Given an unauthenticated user
When they try to access any protected route
Then they are redirected to the login page
```

---

## EP-002: Idea Submission

---

### US-005 – Submit an Idea

| Field    | Value  |
| -------- | ------ |
| Story ID | US-005 |
| Epic     | EP-002 |
| Priority | P1     |

**Story:**
As a Submitter, I want to submit an idea using a form with title, description, and category, so that I can formally propose my innovation to the evaluation team.

**Acceptance Criteria:**

```
Given I am logged in as a Submitter on the idea submission page
When I fill in a valid title, description, and select a category, then click "Submit"
Then my idea is saved with status "submitted"
  And I see a confirmation message with my idea's reference number
  And the idea appears in my submissions list

Given I attempt to submit with any required field left blank
When I click "Submit"
Then inline validation errors highlight the missing fields
  And the form is not submitted

Given I successfully submit an idea
When an AdminEvaluator views the idea list
Then the new idea is visible with status "submitted"
```

---

### US-006 – Attach a Single File to an Idea

| Field    | Value  |
| -------- | ------ |
| Story ID | US-006 |
| Epic     | EP-002 |
| Priority | P1     |

**Story:**
As a Submitter, I want to attach a single supporting file to my idea submission, so that I can provide additional context or documentation for evaluators.

**Acceptance Criteria:**

```
Given I am on the idea submission form
When I attach a file within the allowed size and type limits (e.g., PDF, DOCX, PNG ≤ 10 MB)
Then the file is uploaded and linked to my submission
  And the file name is displayed as a confirmation

Given I attempt to attach a file that exceeds the size limit or has an unsupported type
When the file is selected
Then I see a clear error message stating the restriction
  And the file is not attached

Given an AdminEvaluator views an idea with an attachment
When they click the attachment link
Then the file is downloadable
```

---

### US-007 – View Submission Confirmation

| Field    | Value  |
| -------- | ------ |
| Story ID | US-007 |
| Epic     | EP-002 |
| Priority | P1     |

**Story:**
As a Submitter, I want to receive a confirmation after submitting an idea, so that I know my submission was recorded successfully.

**Acceptance Criteria:**

```
Given I have submitted a valid idea
When the submission is processed
Then I am shown a confirmation screen with the idea title and a unique reference number
  And the idea status is displayed as "submitted"

Given a submission fails due to a server error
When I submit the form
Then I see a user-friendly error message
  And my form data is preserved so I can retry without re-entering information
```

---

## EP-003: Idea Evaluation Workflow

---

### US-008 – View All Submitted Ideas (AdminEvaluator)

| Field    | Value  |
| -------- | ------ |
| Story ID | US-008 |
| Epic     | EP-003 |
| Priority | P1     |

**Story:**
As an AdminEvaluator, I want to view a list of all submitted ideas, so that I can identify which ideas need review.

**Acceptance Criteria:**

```
Given I am logged in as an AdminEvaluator
When I navigate to the evaluation dashboard
Then I see a list of all ideas with their title, submitter name, category, submission date, and current status

Given there are ideas with different statuses
When I view the dashboard
Then ideas are displayed with their current status (submitted, under review, accepted, rejected)

Given there are no submitted ideas
When I view the dashboard
Then I see an empty-state message ("No ideas submitted yet")
```

---

### US-009 – Mark an Idea as Under Review

| Field    | Value  |
| -------- | ------ |
| Story ID | US-009 |
| Epic     | EP-003 |
| Priority | P1     |

**Story:**
As an AdminEvaluator, I want to mark an idea as "under review", so that submitters know their idea is being actively evaluated.

**Acceptance Criteria:**

```
Given I am viewing an idea with status "submitted"
When I click "Start Review"
Then the idea status changes to "under review"
  And the submitter's idea list reflects the updated status

Given an idea is already "under review"
When I view its detail page
Then the "Start Review" action is no longer available
```

---

### US-010 – Accept an Idea with a Comment

| Field    | Value  |
| -------- | ------ |
| Story ID | US-010 |
| Epic     | EP-003 |
| Priority | P1     |

**Story:**
As an AdminEvaluator, I want to accept an idea and provide a mandatory comment, so that the submitter understands why their idea was selected and what the next steps are.

**Acceptance Criteria:**

```
Given I am reviewing an idea with status "under review"
When I click "Accept" and enter a comment, then confirm
Then the idea status changes to "accepted"
  And the comment is saved and visible to the submitter
  And the action is logged with my name and timestamp

Given I click "Accept" but leave the comment field empty
When I try to confirm
Then I see a validation error: "A comment is required to accept an idea"
  And the status is not changed
```

---

### US-011 – Reject an Idea with a Comment

| Field    | Value  |
| -------- | ------ |
| Story ID | US-011 |
| Epic     | EP-003 |
| Priority | P1     |

**Story:**
As an AdminEvaluator, I want to reject an idea and provide a mandatory comment, so that the submitter receives constructive feedback and understands the reason for the decision.

**Acceptance Criteria:**

```
Given I am reviewing an idea with status "under review"
When I click "Reject" and enter a comment, then confirm
Then the idea status changes to "rejected"
  And the comment is saved and visible to the submitter
  And the action is logged with my name and timestamp

Given I click "Reject" but leave the comment field empty
When I try to confirm
Then I see a validation error: "A comment is required to reject an idea"
  And the status is not changed
```

---

## EP-004: Status Tracking

---

### US-012 – View My Submitted Ideas and Their Status

| Field    | Value  |
| -------- | ------ |
| Story ID | US-012 |
| Epic     | EP-004 |
| Priority | P1     |

**Story:**
As a Submitter, I want to view a list of all my submitted ideas with their current status, so that I can monitor the progress of each submission.

**Acceptance Criteria:**

```
Given I am logged in as a Submitter
When I navigate to "My Ideas"
Then I see only my own ideas listed with their title, category, submission date, and current status

Given one of my ideas has been accepted or rejected
When I view "My Ideas"
Then the updated status (accepted / rejected) is shown without needing to refresh

Given I have not submitted any ideas
When I view "My Ideas"
Then I see an empty-state message ("You haven't submitted any ideas yet")
```

---

### US-013 – View Evaluator Feedback on My Idea

| Field    | Value  |
| -------- | ------ |
| Story ID | US-013 |
| Epic     | EP-004 |
| Priority | P1     |

**Story:**
As a Submitter, I want to read the evaluator's comment when my idea is accepted or rejected, so that I understand the reasoning behind the decision.

**Acceptance Criteria:**

```
Given my idea has been accepted or rejected by an AdminEvaluator
When I open the idea detail page
Then I see the evaluator's comment displayed clearly below the status

Given my idea is still "submitted" or "under review"
When I open the idea detail page
Then no evaluator comment is shown
  And the status reflects the current stage

Given the evaluator's comment is long
When I view the detail page
Then the full comment is readable without truncation
```

---

## EP-005: Idea Listing and Search

---

### US-014 – Browse All Ideas

| Field    | Value  |
| -------- | ------ |
| Story ID | US-014 |
| Epic     | EP-005 |
| Priority | P1     |

**Story:**
As any authenticated user, I want to browse all submitted ideas, so that I can discover existing innovations and avoid submitting duplicates.

**Acceptance Criteria:**

```
Given I am logged in as any role
When I navigate to the ideas listing page
Then I see all submitted ideas with their title, category, submitter name, and status

Given the list contains many ideas
When I scroll through the listing
Then ideas are paginated or lazily loaded to ensure performance

Given I click on an idea from the list
When the detail page loads
Then I can read the full idea title, description, category, status, and attachment (if any)
```

---

### US-015 – Search Ideas by Keyword

| Field    | Value  |
| -------- | ------ |
| Story ID | US-015 |
| Epic     | EP-005 |
| Priority | P2     |

**Story:**
As any authenticated user, I want to search for ideas by keyword, so that I can quickly find relevant submissions without scrolling through the entire list.

**Acceptance Criteria:**

```
Given I am on the ideas listing page
When I type a keyword into the search bar and press Enter or click Search
Then the list updates to show only ideas whose title or description contains the keyword
  And the number of results is displayed

Given my search query returns no results
When the list updates
Then I see a "No ideas found" message with a suggestion to clear the search

Given I clear the search input
When the search is reset
Then all ideas are displayed again
```

---

### US-016 – Filter Ideas by Category

| Field    | Value  |
| -------- | ------ |
| Story ID | US-016 |
| Epic     | EP-005 |
| Priority | P2     |

**Story:**
As any authenticated user, I want to filter ideas by category, so that I can focus on a specific area of innovation relevant to me.

**Acceptance Criteria:**

```
Given I am on the ideas listing page
When I select a category from the filter dropdown
Then the list updates to show only ideas belonging to that category
  And the active filter is visually indicated

Given I select a category with no ideas
When the filter is applied
Then I see an empty-state message ("No ideas in this category yet")

Given I want to remove a filter
When I select "All Categories" or clear the filter
Then all ideas are displayed again
```

---

### US-017 – Filter Ideas by Status

| Field    | Value  |
| -------- | ------ |
| Story ID | US-017 |
| Epic     | EP-005 |
| Priority | P2     |

**Story:**
As an AdminEvaluator, I want to filter ideas by status (submitted, under review, accepted, rejected), so that I can manage my evaluation workload efficiently.

**Acceptance Criteria:**

```
Given I am logged in as an AdminEvaluator on the evaluation dashboard
When I select a status filter (e.g., "submitted")
Then only ideas with that status are displayed

Given I apply a status filter and there are no matching ideas
When the list updates
Then I see an empty-state message relevant to the selected status

Given I want to view all ideas regardless of status
When I clear or reset the status filter
Then all ideas are displayed across all statuses
```
