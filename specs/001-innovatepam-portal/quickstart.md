# Quickstart: InnovatEPAM Portal (Local Development)

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14

---

## Prerequisites

| Tool     | Version  | Install                               |
| -------- | -------- | ------------------------------------- |
| .NET SDK | 8.x      | https://dotnet.microsoft.com/download |
| Node.js  | 20.x LTS | https://nodejs.org                    |
| Git      | Any      | https://git-scm.com                   |

Verify:

```powershell
dotnet --version   # 8.x.x
node --version     # v20.x.x
npm --version      # 10.x.x
```

---

## 1. Clone and Navigate

```powershell
git clone <repo-url> InnovatEpam
cd InnovatEpam
```

---

## 2. Backend Setup

### 2a. Configure secrets

Create `backend/InnovatEpam.Api/appsettings.Development.json` (this file is git-ignored):

```json
{
  "Jwt": {
    "Secret": "REPLACE_WITH_A_LONG_RANDOM_SECRET_MIN_32_CHARS",
    "Issuer": "InnovatEpamApi",
    "Audience": "InnovatEpamClient",
    "AccessTokenExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  "ConnectionStrings": {
    "Default": "Data Source=innovatepam.db"
  },
  "FileStorage": {
    "UploadPath": "uploads"
  }
}
```

> Generate a secret: `[System.Convert]::ToBase64String((1..48 | ForEach-Object { [byte](Get-Random -Max 256) }))`

### 2b. Restore, migrate, and run

```powershell
cd backend/InnovatEpam.Api

# Restore NuGet packages
dotnet restore

# Apply EF Core migrations (creates innovatepam.db + seeds AdminEvaluator)
dotnet ef database update

# Start the API (listens on https://localhost:7001 and http://localhost:5001)
dotnet run
```

The API is ready when you see:

```
Now listening on: https://localhost:7001
Now listening on: http://localhost:5001
```

**Seed credentials** (change immediately after first login):

- Email: `admin@epam.com`
- Password: `Admin1234`

---

## 3. Frontend Setup

```powershell
# Open a new terminal tab
cd frontend

# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev
```

Open http://localhost:5173 in your browser.

The Vite dev server proxies `/api/*` requests to `https://localhost:7001` — no manual CORS headers needed during development.

---

## 4. Verify the Setup

Follow these manual verification steps in order:

1. **Register** — go to `/register`, create `test@epam.com` with password `Test1234A`. Verify redirect to login.
2. **Login as Submitter** — log in with `test@epam.com`. Verify the Submitter dashboard is shown.
3. **Submit an idea** — navigate to `/ideas/new`, fill in all fields, attach a PDF. Verify confirmation and "My Ideas" shows the new entry with status `Submitted`.
4. **Login as AdminEvaluator** — log out, then log in as `admin@epam.com`. Verify the Admin Dashboard shows the submitted idea.
5. **Start Review** — click "Start Review" on the idea. Verify status changes to `Under Review`.
6. **Accept** — click "Accept", enter a comment, confirm. Verify status changes to `Accepted`.
7. **Check Submitter view** — log out, log back in as `test@epam.com`. Open the idea — verify status is `Accepted` and the evaluator's comment is visible.

---

## 5. Useful Commands

```powershell
# Add a new EF Core migration (from backend/InnovatEpam.Api/)
dotnet ef migrations add <MigrationName>

# Reset the database (drops and recreates)
Remove-Item innovatepam.db -ErrorAction SilentlyContinue
dotnet ef database update

# Build frontend for production
cd frontend
npm run build          # outputs to frontend/dist/

# Lint frontend
npm run lint
```

---

## 6. Environment Variables (Production)

For production deployment, set these environment variables on the host instead of using `appsettings.json`:

| Variable                     | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `Jwt__Secret`                | JWT signing secret (min 32 chars)             |
| `Jwt__Issuer`                | Token issuer string                           |
| `Jwt__Audience`              | Token audience string                         |
| `ConnectionStrings__Default` | SQLite DB path (e.g., `/data/innovatepam.db`) |
| `FileStorage__UploadPath`    | Absolute path for file uploads                |

ASP.NET Core automatically maps double-underscore `__` to nested JSON config keys.
