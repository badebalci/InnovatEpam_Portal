# InnovatEPAM Portal

A full-stack innovation management portal where employees submit ideas, track them through a multi-stage review pipeline, and receive structured feedback with a 5-dimension scoring system.

---

## Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Backend          | ASP.NET Core 9 Web API, C#         |
| Frontend         | React 18 + TypeScript, Vite        |
| Database         | SQLite via Entity Framework Core 9 |
| Auth             | JWT Bearer + Refresh Tokens        |
| UI               | Tailwind CSS + shadcn/ui           |
| Password hashing | BCrypt.Net-Next                    |

---

## Features

- **Phase 1 – Core Portal:** User registration & login, role-based access (Submitter / AdminEvaluator), idea submission, status tracking, admin evaluation workflow
- **Phase 2 – Smart Submission Forms:** Dynamic form fields and guidance per idea category
- **Phase 3 – Multi-Media Support:** Multiple file attachments per idea with download support
- **Phase 4 – Draft Management:** Save ideas as drafts, edit and submit later
- **Phase 5 – Multi-Stage Review:** Four-stage pipeline — Initial Review → Technical Review → Final Review → Accepted/Rejected — with per-stage comments and history
- **Phase 6 – Blind Review:** Anonymous evaluation mode that masks submitter identity during active review; identity revealed after a final decision
- **Phase 7 – Scoring System:** 5-dimension scoring (Functionality, Reliability, Usability, Maintainability, Efficiency) shown exclusively at the Final Review stage, with a computed overall score

---

## Running Locally

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### 1. Backend

```bash
cd InnovatEpam/backend/InnovatEpam.Api
dotnet run
```

The API starts at **http://localhost:5101**.  
The SQLite database file (`InnovatEpam.db`) is created automatically on first run and seeded with a default admin account.

### 2. Frontend

```bash
cd InnovatEpam/frontend
npm install
npm run dev
```

The app starts at **http://localhost:5173**.

---

## Default Accounts

| Role              | Email            | Password      |
| ----------------- | ---------------- | ------------- |
| Admin / Evaluator | `admin@epam.com` | `Admin1234`   |
| Submitter         | `test@epam.com`  | `Testtest123` |

---

## Project Structure

```
InnovatEpam/
├── backend/
│   └── InnovatEpam.Api/
│       ├── Controllers/     # Thin HTTP handlers
│       ├── Services/        # Business logic
│       ├── Models/          # EF Core entities
│       ├── DTOs/            # Request / response shapes
│       ├── Data/            # DbContext + Seeder
│       └── Migrations/      # EF Core migrations
└── frontend/
    └── src/
        ├── pages/           # Route-level components
        ├── components/      # Reusable UI components
        ├── services/        # API call modules
        ├── hooks/           # Custom React hooks
        ├── types/           # Shared TypeScript types
        └── lib/             # Utilities and constants
```

---

## Architecture Notes

- All business logic is in service classes; controllers are thin (validate → call service → map to HTTP response).
- API responses always use DTOs — EF entities are never returned directly.
- List endpoints are paginated via `PagedResult<T>`.
- Errors always return `{ "error": "..." }` JSON.

See [constitution.md](constitution.md) for the full coding principles that govern this project.

---

_Developer: Bade Balcı — May 2026_
