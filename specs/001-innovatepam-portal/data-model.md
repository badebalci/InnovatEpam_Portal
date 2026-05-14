# Data Model: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Date**: 2026-05-14

---

## Entities Overview

```
User ──< Idea ──── Attachment  (0..1)
              └── Evaluation   (0..1)
User ──< Evaluation
User ──< RefreshToken
```

---

## EF Core Entity Definitions (C#)

### Enums

```csharp
public enum Role
{
    Submitter,
    AdminEvaluator
}

public enum IdeaCategory
{
    Technology,
    Process,
    Product,
    People,
    Other
}

public enum IdeaStatus
{
    Submitted,
    UnderReview,
    Accepted,
    Rejected
}

public enum EvaluationDecision
{
    Accepted,
    Rejected
}
```

---

### User

```csharp
public class User
{
    public int Id { get; set; }

    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;          // @epam.com, unique index

    [Required]
    public string PasswordHash { get; set; } = string.Empty;   // BCrypt hash

    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    public Role Role { get; set; } = Role.Submitter;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Idea> Ideas { get; set; } = [];
    public ICollection<Evaluation> Evaluations { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
```

**Index**: `UNIQUE (Email)`

---

### Idea

```csharp
public class Idea
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    public IdeaCategory Category { get; set; }

    public IdeaStatus Status { get; set; } = IdeaStatus.Submitted;

    public int SubmitterId { get; set; }
    public User Submitter { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation (optional 1-to-1)
    public Attachment? Attachment { get; set; }
    public Evaluation? Evaluation { get; set; }
}
```

**Index**: `(SubmitterId)`, `(Status)`, `(Category)`

---

### Attachment

```csharp
public class Attachment
{
    public int Id { get; set; }

    public int IdeaId { get; set; }
    public Idea Idea { get; set; } = null!;

    [Required, MaxLength(260)]
    public string OriginalFileName { get; set; } = string.Empty;   // display name

    [Required, MaxLength(512)]
    public string StoragePath { get; set; } = string.Empty;        // server file path

    [Required, MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;        // MIME type

    public long FileSizeBytes { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
```

**Allowed MIME types**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/png`, `image/jpeg`
**Max size**: 10 485 760 bytes (10 MB)
**Index**: `UNIQUE (IdeaId)` — one attachment per idea

---

### Evaluation

```csharp
public class Evaluation
{
    public int Id { get; set; }

    public int IdeaId { get; set; }
    public Idea Idea { get; set; } = null!;

    public int EvaluatorId { get; set; }
    public User Evaluator { get; set; } = null!;

    public EvaluationDecision Decision { get; set; }

    [Required, MinLength(1), MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    public DateTime DecidedAt { get; set; } = DateTime.UtcNow;
}
```

**Index**: `UNIQUE (IdeaId)` — one evaluation record per idea

---

### RefreshToken

```csharp
public class RefreshToken
{
    public int Id { get; set; }

    [Required, MaxLength(512)]
    public string Token { get; set; } = string.Empty;    // opaque random string, unique

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }              // now + 7 days

    public bool IsRevoked { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

**Index**: `UNIQUE (Token)`

---

## AppDbContext Configuration

```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        mb.Entity<Idea>()
            .HasOne(i => i.Submitter)
            .WithMany(u => u.Ideas)
            .HasForeignKey(i => i.SubmitterId)
            .OnDelete(DeleteBehavior.Restrict);

        mb.Entity<Attachment>()
            .HasOne(a => a.Idea)
            .WithOne(i => i.Attachment)
            .HasForeignKey<Attachment>(a => a.IdeaId)
            .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<Evaluation>()
            .HasOne(e => e.Idea)
            .WithOne(i => i.Evaluation)
            .HasForeignKey<Evaluation>(e => e.IdeaId)
            .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<Evaluation>()
            .HasOne(e => e.Evaluator)
            .WithMany(u => u.Evaluations)
            .HasForeignKey(e => e.EvaluatorId)
            .OnDelete(DeleteBehavior.Restrict);

        mb.Entity<RefreshToken>()
            .HasIndex(r => r.Token).IsUnique();

        // Store enums as strings for readability in SQLite
        mb.Entity<User>().Property(u => u.Role).HasConversion<string>();
        mb.Entity<Idea>().Property(i => i.Category).HasConversion<string>();
        mb.Entity<Idea>().Property(i => i.Status).HasConversion<string>();
        mb.Entity<Evaluation>().Property(e => e.Decision).HasConversion<string>();
    }
}
```

---

## SQLite Schema (generated by migrations)

```sql
CREATE TABLE Users (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    Email       TEXT    NOT NULL UNIQUE,
    PasswordHash TEXT   NOT NULL,
    FullName    TEXT    NOT NULL,
    Role        TEXT    NOT NULL DEFAULT 'Submitter',
    CreatedAt   TEXT    NOT NULL
);

CREATE TABLE Ideas (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    Title       TEXT    NOT NULL,
    Description TEXT    NOT NULL,
    Category    TEXT    NOT NULL,
    Status      TEXT    NOT NULL DEFAULT 'Submitted',
    SubmitterId INTEGER NOT NULL REFERENCES Users(Id),
    CreatedAt   TEXT    NOT NULL,
    UpdatedAt   TEXT    NOT NULL
);

CREATE TABLE Attachments (
    Id               INTEGER PRIMARY KEY AUTOINCREMENT,
    IdeaId           INTEGER NOT NULL UNIQUE REFERENCES Ideas(Id) ON DELETE CASCADE,
    OriginalFileName TEXT    NOT NULL,
    StoragePath      TEXT    NOT NULL,
    ContentType      TEXT    NOT NULL,
    FileSizeBytes    INTEGER NOT NULL,
    UploadedAt       TEXT    NOT NULL
);

CREATE TABLE Evaluations (
    Id          INTEGER PRIMARY KEY AUTOINCREMENT,
    IdeaId      INTEGER NOT NULL UNIQUE REFERENCES Ideas(Id) ON DELETE CASCADE,
    EvaluatorId INTEGER NOT NULL REFERENCES Users(Id),
    Decision    TEXT    NOT NULL,
    Comment     TEXT    NOT NULL,
    DecidedAt   TEXT    NOT NULL
);

CREATE TABLE RefreshTokens (
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    Token      TEXT    NOT NULL UNIQUE,
    UserId     INTEGER NOT NULL REFERENCES Users(Id),
    ExpiresAt  TEXT    NOT NULL,
    IsRevoked  INTEGER NOT NULL DEFAULT 0,
    CreatedAt  TEXT    NOT NULL
);
```

---

## Seed Data

```csharp
// Seeder.cs — runs once on app startup; idempotent
public static class Seeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Users.Any(u => u.Role == Role.AdminEvaluator)) return;

        db.Users.Add(new User
        {
            Email        = "admin@epam.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234"),
            FullName     = "EPAM Admin",
            Role         = Role.AdminEvaluator,
            CreatedAt    = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}
```

> **Important**: The seed password `Admin1234` is for bootstrap only. EPAM management must change it immediately after first login.

---

## Frontend TypeScript Types

```typescript
// src/types/index.ts

export type Role = "Submitter" | "AdminEvaluator";

export type IdeaCategory =
  | "Technology"
  | "Process"
  | "Product"
  | "People"
  | "Other";

export type IdeaStatus = "Submitted" | "UnderReview" | "Accepted" | "Rejected";

export type EvaluationDecision = "Accepted" | "Rejected";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface IdeaSummary {
  id: number;
  title: string;
  category: IdeaCategory;
  status: IdeaStatus;
  submitterName: string;
  createdAt: string; // ISO 8601
}

export interface IdeaDetail extends IdeaSummary {
  description: string;
  attachment?: { fileName: string };
  evaluation?: {
    decision: EvaluationDecision;
    comment: string;
    evaluatorName: string;
    decidedAt: string;
  };
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
```
