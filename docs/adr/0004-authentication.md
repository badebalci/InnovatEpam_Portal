# ADR-0004: Authentication – JSON Web Tokens (JWT)

## Status

Accepted

## Date

2026-05-14

---

## Context

The InnovatEPAM Portal requires a secure authentication mechanism that:
- Verifies the identity of EPAM employees before granting access to the portal.
- Associates each authenticated session with a specific user and role (Submitter or AdminEvaluator).
- Protects all API endpoints so that unauthenticated requests are rejected.
- Enforces role-based access control (RBAC) to prevent Submitters from accessing AdminEvaluator-only features (and vice versa).
- Works seamlessly with the chosen frontend (React SPA) and backend (ASP.NET Core Web API).

The platform is internal-only; all users are EPAM employees. There is no requirement for external OAuth providers (e.g., Google, GitHub) or SSO integration in the MVP. SSO/SAML integration with EPAM's identity provider is noted as a potential future enhancement.

Alternatives considered:

| Option | Pros | Cons |
|---|---|---|
| **JWT (Bearer tokens)** | Stateless, standard, excellent ASP.NET Core support, SPA-friendly | Token revocation requires additional strategy (e.g., short expiry + refresh tokens) |
| ASP.NET Core Identity (cookie-based) | Built-in, session management included | Cookies require CSRF protection; less natural for SPA + API separation |
| OAuth 2.0 / OpenID Connect (EPAM SSO) | Enterprise-grade, single sign-on | EPAM SSO not available for MVP; significant integration complexity |
| Session-based auth (server-side) | Simple mental model | Stateful; does not scale horizontally; poor fit for SPA architecture |

---

## Decision

We will use **JWT (JSON Web Token) Bearer authentication** implemented via **ASP.NET Core's built-in JWT middleware** (`Microsoft.AspNetCore.Authentication.JwtBearer`).

### Token design:
- Tokens are signed using **HMAC-SHA256** with a secret key stored in environment variables (never in source code or appsettings.json committed to version control).
- Token payload includes: `sub` (user ID), `email`, `role` (Submitter | AdminEvaluator), `iat`, `exp`.
- **Access token expiry: 60 minutes.**
- **Refresh token** (opaque, stored in the database): 7-day expiry, single-use, rotated on each refresh.
- Refresh token is transmitted via **HttpOnly, Secure, SameSite=Strict cookie** to prevent XSS-based theft.
- Access token is stored in **memory only** on the React client (never in localStorage or sessionStorage).

### API enforcement:
- All endpoints except `/api/auth/login` and `/api/auth/register` require a valid Bearer token.
- Role claims in the token are validated by `[Authorize(Roles = "AdminEvaluator")]` attributes on admin endpoints.
- Token validation failures return `401 Unauthorized`; role failures return `403 Forbidden`.

---

## Consequences

**Positive:**
- Stateless access tokens allow the API to scale horizontally without shared session state.
- ASP.NET Core's JWT middleware handles token parsing, signature validation, and claim extraction with minimal custom code.
- Role claims embedded in the token enable the React frontend to render role-appropriate UI without an extra API call.
- HttpOnly cookie for the refresh token eliminates the most common XSS attack vector against authentication tokens.
- Short access token expiry (60 min) limits the blast radius of a compromised token.

**Negative / Trade-offs:**
- Access tokens cannot be instantly revoked before expiry (e.g., if a user's role changes mid-session). Mitigation: short expiry window (60 min) means the impact window is limited.
- Refresh token rotation and storage adds implementation complexity over simple session cookies.
- The secret key must be securely managed; exposure compromises all issued tokens. Mitigation: store in environment variables / secrets manager, rotate on suspected compromise.

**Security checklist:**
- [ ] JWT secret stored in environment variable, excluded from source control.
- [ ] HTTPS enforced on all environments (HTTP redirected to HTTPS).
- [ ] Refresh token cookie: `HttpOnly`, `Secure`, `SameSite=Strict`.
- [ ] Access token stored in memory only on the client.
- [ ] Token claims validated on every request (expiry, issuer, audience).
- [ ] Failed login attempts rate-limited to prevent brute-force attacks.
