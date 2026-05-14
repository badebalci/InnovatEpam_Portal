# API Contract: Ideas

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14
**Base URL**: `/api/ideas`
**Auth**: All endpoints require `Authorization: Bearer <accessToken>`

---

## GET /api/ideas

Returns a paginated, role-scoped list of ideas with optional search and filter.

- **Submitter**: sees only their own ideas.
- **AdminEvaluator**: sees all ideas.

### Request

```http
GET /api/ideas?page=1&pageSize=20&search=blockchain&category=Technology&status=Submitted
Authorization: Bearer <accessToken>
```

| Query Param | Type   | Default | Description                                                   |
| ----------- | ------ | ------- | ------------------------------------------------------------- |
| `page`      | int    | `1`     | 1-based page number                                           |
| `pageSize`  | int    | `20`    | Items per page (max 100)                                      |
| `search`    | string | —       | Keyword matched against title and description                 |
| `category`  | string | —       | One of: `Technology`, `Process`, `Product`, `People`, `Other` |
| `status`    | string | —       | One of: `Submitted`, `UnderReview`, `Accepted`, `Rejected`    |

### Response

**200 OK**

```json
{
  "items": [
    {
      "id": 7,
      "title": "Blockchain for contract signing",
      "category": "Technology",
      "status": "Submitted",
      "submitterName": "Jane Doe",
      "createdAt": "2026-05-14T10:30:00Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20
}
```

**401 Unauthorized** — missing or invalid token

---

## POST /api/ideas

Submit a new idea. Optionally includes a file attachment in the same multipart request.

### Request

```http
POST /api/ideas
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

| Field         | Type   | Required | Rules                                                         |
| ------------- | ------ | -------- | ------------------------------------------------------------- |
| `title`       | string | ✅       | 1–200 characters                                              |
| `description` | string | ✅       | 1–5000 characters                                             |
| `category`    | string | ✅       | One of: `Technology`, `Process`, `Product`, `People`, `Other` |
| `file`        | file   | ❌       | PDF, DOCX, PNG, JPG; max 10 MB                                |

### Responses

**201 Created**

```json
{
  "id": 7,
  "title": "Blockchain for contract signing",
  "description": "Using blockchain technology to...",
  "category": "Technology",
  "status": "Submitted",
  "submitterName": "Jane Doe",
  "createdAt": "2026-05-14T10:30:00Z",
  "updatedAt": "2026-05-14T10:30:00Z",
  "attachment": null
}
```

**400 Bad Request** — validation failure

```json
{
  "errors": {
    "title": ["Title is required."],
    "file": ["File type not supported. Allowed: PDF, DOCX, PNG, JPG."]
  }
}
```

**401 Unauthorized**

**403 Forbidden** — only Submitters may submit ideas

---

## GET /api/ideas/{id}

Get the full detail of a single idea including evaluation comment (if any).

- **Submitter**: may only retrieve their own ideas.
- **AdminEvaluator**: may retrieve any idea.

### Request

```http
GET /api/ideas/7
Authorization: Bearer <accessToken>
```

### Responses

**200 OK**

```json
{
  "id": 7,
  "title": "Blockchain for contract signing",
  "description": "Using blockchain technology to...",
  "category": "Technology",
  "status": "Accepted",
  "submitterName": "Jane Doe",
  "createdAt": "2026-05-14T10:30:00Z",
  "updatedAt": "2026-05-14T11:45:00Z",
  "attachment": {
    "fileName": "proposal.pdf"
  },
  "evaluation": {
    "decision": "Accepted",
    "comment": "Strong commercial potential. Moving to Phase 2 planning.",
    "evaluatorName": "EPAM Admin",
    "decidedAt": "2026-05-14T11:45:00Z"
  }
}
```

**401 Unauthorized**

**403 Forbidden** — Submitter attempting to access another user's idea

**404 Not Found**

```json
{ "error": "Idea not found." }
```

---

## GET /api/ideas/{id}/attachment

Download the file attached to an idea.

### Request

```http
GET /api/ideas/7/attachment
Authorization: Bearer <accessToken>
```

### Responses

**200 OK** — returns the file as a download

```
Content-Disposition: attachment; filename="proposal.pdf"
Content-Type: application/pdf
```

**401 Unauthorized**

**403 Forbidden** — Submitter accessing another user's idea

**404 Not Found** — idea has no attachment

```json
{ "error": "No attachment found for this idea." }
```
