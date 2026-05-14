# API Contract: Evaluations

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14
**Base URL**: `/api/ideas/{id}`
**Auth**: All endpoints require `Authorization: Bearer <accessToken>` with role `AdminEvaluator`

---

## Status Lifecycle

```
Submitted ──► UnderReview ──► Accepted
                          └──► Rejected
```

Transitions are enforced server-side. Any request that would violate the lifecycle returns **409 Conflict**.

---

## PATCH /api/ideas/{id}/review

Move an idea from `Submitted` to `UnderReview`. Signals to the submitter that their idea is being actively evaluated.

### Request

```http
PATCH /api/ideas/7/review
Authorization: Bearer <accessToken>
```

No request body.

### Responses

**200 OK**

```json
{
  "id": 7,
  "status": "UnderReview",
  "updatedAt": "2026-05-14T11:00:00Z"
}
```

**401 Unauthorized** — missing or invalid token

**403 Forbidden** — caller is not an AdminEvaluator

**404 Not Found**

```json
{ "error": "Idea not found." }
```

**409 Conflict** — idea is not in `Submitted` status

```json
{
  "error": "Cannot start review. Idea must be in 'Submitted' status.",
  "currentStatus": "UnderReview"
}
```

---

## POST /api/ideas/{id}/evaluate

Accept or reject an idea that is currently `UnderReview`. A non-empty comment is mandatory for both decisions.

### Request

```http
POST /api/ideas/7/evaluate
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "decision": "Accepted",
  "comment": "Strong commercial potential. Moving to Phase 2 planning."
}
```

| Field      | Type   | Required | Rules                                                   |
| ---------- | ------ | -------- | ------------------------------------------------------- |
| `decision` | string | ✅       | Must be `"Accepted"` or `"Rejected"`                    |
| `comment`  | string | ✅       | 1–2000 characters; must not be blank or whitespace-only |

### Responses

**200 OK**

```json
{
  "id": 7,
  "status": "Accepted",
  "updatedAt": "2026-05-14T11:45:00Z",
  "evaluation": {
    "decision": "Accepted",
    "comment": "Strong commercial potential. Moving to Phase 2 planning.",
    "evaluatorName": "EPAM Admin",
    "decidedAt": "2026-05-14T11:45:00Z"
  }
}
```

**400 Bad Request** — comment missing or blank

```json
{
  "errors": {
    "comment": ["A comment is required when accepting or rejecting an idea."],
    "decision": ["Decision must be 'Accepted' or 'Rejected'."]
  }
}
```

**401 Unauthorized**

**403 Forbidden** — caller is not an AdminEvaluator

**404 Not Found**

```json
{ "error": "Idea not found." }
```

**409 Conflict** — idea is not in `UnderReview` status

```json
{
  "error": "Cannot evaluate. Idea must be in 'UnderReview' status before accepting or rejecting.",
  "currentStatus": "Submitted"
}
```

---

## Error Response Shape (All Endpoints)

All error responses follow a consistent envelope:

```json
{
  "error": "Human-readable single error message."
}
```

Or for validation failures with multiple field errors:

```json
{
  "errors": {
    "<fieldName>": ["<error message>", "..."]
  }
}
```

HTTP status codes used:

| Code | Meaning                                                                    |
| ---- | -------------------------------------------------------------------------- |
| 200  | Success with body                                                          |
| 201  | Created                                                                    |
| 204  | Success, no body                                                           |
| 400  | Validation / bad input                                                     |
| 401  | Not authenticated                                                          |
| 403  | Authenticated but wrong role                                               |
| 404  | Resource not found                                                         |
| 409  | Business rule conflict (e.g. wrong status transition)                      |
| 500  | Unexpected server error (generic message shown; detail logged server-side) |
