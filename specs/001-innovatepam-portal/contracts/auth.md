# API Contract: Authentication

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14
**Base URL**: `/api/auth`

---

## POST /api/auth/register

Register a new EPAM employee account. All new accounts receive the `Submitter` role.

### Request

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "email": "jane.doe@epam.com",
  "fullName": "Jane Doe",
  "password": "SecurePass1"
}
```

| Field      | Type   | Required | Rules                                     |
| ---------- | ------ | -------- | ----------------------------------------- |
| `email`    | string | ✅       | Must end with `@epam.com`; must be unique |
| `fullName` | string | ✅       | 1–200 characters                          |
| `password` | string | ✅       | Min 8 chars, ≥1 uppercase, ≥1 number      |

### Responses

**201 Created**

```json
{
  "message": "Registration successful. Please log in."
}
```

**400 Bad Request** — validation failure

```json
{
  "errors": {
    "email": ["Email must be an @epam.com address."],
    "password": [
      "Password must be at least 8 characters and contain an uppercase letter and a number."
    ]
  }
}
```

**409 Conflict** — email already registered

```json
{
  "error": "An account with this email already exists."
}
```

---

## POST /api/auth/login

Authenticate with email and password. Returns a short-lived access token in the response body and sets a long-lived refresh token as an HttpOnly cookie.

### Request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "jane.doe@epam.com",
  "password": "SecurePass1"
}
```

### Responses

**200 OK**

Response body:

```json
{
  "accessToken": "<JWT string>",
  "user": {
    "id": 42,
    "fullName": "Jane Doe",
    "email": "jane.doe@epam.com",
    "role": "Submitter"
  }
}
```

Response header (HttpOnly cookie):

```
Set-Cookie: refreshToken=<opaque_token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

**400 Bad Request** — missing fields

```json
{ "error": "Email and password are required." }
```

**401 Unauthorized** — wrong credentials

```json
{ "error": "Invalid email or password." }
```

> Note: The 401 message is deliberately generic. Do not distinguish "email not found" from "wrong password" to prevent user enumeration.

---

## POST /api/auth/refresh

Exchange a valid refresh token (sent automatically via cookie) for a new access token. The old refresh token is revoked and a new one is issued (rotation).

### Request

```http
POST /api/auth/refresh
```

No body. The `refreshToken` cookie is sent automatically by the browser.

### Responses

**200 OK**

```json
{
  "accessToken": "<new JWT string>"
}
```

New `Set-Cookie: refreshToken=...` header is also returned (rotated token).

**401 Unauthorized** — missing, expired, or revoked refresh token

```json
{ "error": "Session expired. Please log in again." }
```

---

## POST /api/auth/logout

Revoke the current refresh token and clear the cookie.

### Request

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

### Responses

**204 No Content**

The `refreshToken` cookie is cleared:

```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0
```

---

## JWT Access Token Structure

**Header**

```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload**

```json
{
  "sub": "42",
  "email": "jane.doe@epam.com",
  "name": "Jane Doe",
  "role": "Submitter",
  "iat": 1747209600,
  "exp": 1747213200
}
```

| Claim   | Description                         |
| ------- | ----------------------------------- |
| `sub`   | User ID (integer as string)         |
| `email` | User's EPAM email                   |
| `name`  | User's full name                    |
| `role`  | `Submitter` or `AdminEvaluator`     |
| `iat`   | Issued at (Unix timestamp)          |
| `exp`   | Expires at — 60 minutes after `iat` |
