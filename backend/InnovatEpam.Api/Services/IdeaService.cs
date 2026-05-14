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

        if (request.File is not null)
        {
            var (valid, error) = fileStorage.ValidateFile(request.File);
            if (!valid)
            {
                errors["file"] = [error!];
                return (null, errors);
            }
        }

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

        if (request.File is not null)
        {
            var storagePath = await fileStorage.SaveAsync(request.File, idea.Id);
            var attachment = new Attachment
            {
                IdeaId = idea.Id,
                OriginalFileName = Path.GetFileName(request.File.FileName),
                StoragePath = storagePath,
                ContentType = request.File.ContentType,
                FileSizeBytes = request.File.Length
            };
            db.Attachments.Add(attachment);
            await db.SaveChangesAsync();
            idea.Attachment = attachment;
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
            .Include(i => i.Attachment)
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
        Attachment = idea.Attachment is null ? null : new AttachmentDto
        {
            FileName = idea.Attachment.OriginalFileName
        },
        Evaluation = idea.Evaluation is null ? null : new EvaluationDto
        {
            Decision = idea.Evaluation.Decision.ToString(),
            Comment = idea.Evaluation.Comment,
            EvaluatorName = idea.Evaluation.Evaluator.FullName,
            DecidedAt = idea.Evaluation.DecidedAt
        }
    };

    public async Task<(string? StoragePath, string? FileName, string? ContentType, bool Forbidden)> GetAttachmentAsync(
        int ideaId, int userId, string role)
    {
        var idea = await db.Ideas
            .Include(i => i.Attachment)
            .FirstOrDefaultAsync(i => i.Id == ideaId);

        if (idea is null) return (null, null, null, false);
        if (role == "Submitter" && idea.SubmitterId != userId) return (null, null, null, true);
        if (idea.Attachment is null) return (null, null, null, false);

        return (idea.Attachment.StoragePath, idea.Attachment.OriginalFileName, idea.Attachment.ContentType, false);
    }
}
