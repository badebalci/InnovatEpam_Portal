using InnovatEpam.Api.Constants;
using InnovatEpam.Api.Data;
using InnovatEpam.Api.DTOs.Ideas;
using InnovatEpam.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InnovatEpam.Api.Services;

public class IdeaService(AppDbContext db, FileStorageService fileStorage)
{
    public async Task<(IdeaResponse? Response, Dictionary<string, string[]>? Errors)> CreateAsync(
        CreateIdeaRequest request, int submitterId)
    {
        var errors = new Dictionary<string, string[]>();
        var files = request.Files ?? [];

        if (files.Count > AppConstants.MaxAttachmentsPerIdea)
        {
            errors["files"] = [$"You can attach at most {AppConstants.MaxAttachmentsPerIdea} files."];
            return (null, errors);
        }

        foreach (var file in files)
        {
            var (valid, error) = fileStorage.ValidateFile(file);
            if (!valid)
                errors[$"file_{file.FileName}"] = [error!];
        }

        if (errors.Count > 0) return (null, errors);

        var idea = new Idea
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category,
            Status = IdeaStatus.Submitted,
            SubmitterId = submitterId
        };

        db.Ideas.Add(idea);
        await db.SaveChangesAsync();

        foreach (var file in files)
        {
            var storagePath = await fileStorage.SaveAsync(file, idea.Id);
            db.Attachments.Add(new Attachment
            {
                IdeaId = idea.Id,
                OriginalFileName = Path.GetFileName(file.FileName),
                StoragePath = storagePath,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length
            });
        }

        if (files.Count > 0)
        {
            await db.SaveChangesAsync();
            idea.Attachments = await db.Attachments.Where(a => a.IdeaId == idea.Id).ToListAsync();
        }

        var submitter = await db.Users.FindAsync(submitterId);
        return (MapToResponse(idea, submitter!), null);
    }

    public async Task<IdeaListResponse> GetPagedAsync(
        int userId, string role, int page, int pageSize,
        string? search, string? category, string? status)
    {
        pageSize = Math.Min(pageSize, 100);
        page = Math.Max(page, 1);

        var query = db.Ideas
            .Include(i => i.Submitter)
            .AsQueryable();

        if (role == "Submitter")
            query = query.Where(i => i.SubmitterId == userId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(i => i.Title.Contains(search) || i.Description.Contains(search));

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<IdeaCategory>(category, out var cat))
            query = query.Where(i => i.Category == cat);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<IdeaStatus>(status, out var st))
            query = query.Where(i => i.Status == st);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new IdeaSummaryResponse
            {
                Id = i.Id,
                Title = i.Title,
                Category = i.Category.ToString(),
                Status = i.Status.ToString(),
                SubmitterName = i.Submitter.FullName,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();

        return new IdeaListResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<(IdeaResponse? Response, bool Forbidden)> GetByIdAsync(int id, int userId, string role)
    {
        var idea = await db.Ideas
            .Include(i => i.Submitter)
            .Include(i => i.Attachments)
            .Include(i => i.Evaluation)
                .ThenInclude(e => e!.Evaluator)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (idea is null) return (null, false);

        if (role == "Submitter" && idea.SubmitterId != userId)
            return (null, true); // Forbidden

        return (MapToResponse(idea, idea.Submitter), false);
    }

    private static IdeaResponse MapToResponse(Idea idea, User submitter) => new()
    {
        Id = idea.Id,
        Title = idea.Title,
        Description = idea.Description,
        Category = idea.Category.ToString(),
        Status = idea.Status.ToString(),
        SubmitterName = submitter.FullName,
        CreatedAt = idea.CreatedAt,
        UpdatedAt = idea.UpdatedAt,
        Attachments = idea.Attachments.Select(a => new AttachmentDto
        {
            Id = a.Id,
            FileName = a.OriginalFileName
        }).ToList(),
        Evaluation = idea.Evaluation is null ? null : new EvaluationDto
        {
            Decision = idea.Evaluation.Decision.ToString(),
            Comment = idea.Evaluation.Comment,
            EvaluatorName = idea.Evaluation.Evaluator.FullName,
            DecidedAt = idea.Evaluation.DecidedAt
        }
    };

    public async Task<(string? StoragePath, string? FileName, string? ContentType, bool Forbidden)> GetAttachmentAsync(
        int ideaId, int attachmentId, int userId, string role)
    {
        var idea = await db.Ideas
            .Include(i => i.Attachments)
            .FirstOrDefaultAsync(i => i.Id == ideaId);

        if (idea is null) return (null, null, null, false);
        if (role == "Submitter" && idea.SubmitterId != userId) return (null, null, null, true);

        var attachment = idea.Attachments.FirstOrDefault(a => a.Id == attachmentId);
        if (attachment is null) return (null, null, null, false);

        return (attachment.StoragePath, attachment.OriginalFileName, attachment.ContentType, false);
    }
}
