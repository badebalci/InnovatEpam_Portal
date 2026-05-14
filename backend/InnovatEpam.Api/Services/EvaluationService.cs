using InnovatEpam.Api.Data;
using InnovatEpam.Api.DTOs.Evaluations;
using InnovatEpam.Api.DTOs.Ideas;
using InnovatEpam.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InnovatEpam.Api.Services;

public class EvaluationService(AppDbContext db)
{
    public async Task<(IdeaResponse? Response, string? Error, string? CurrentStatus)> StartReviewAsync(int ideaId)
    {
        var idea = await db.Ideas
            .Include(i => i.Submitter)
            .Include(i => i.Attachment)
            .Include(i => i.Evaluation)
                .ThenInclude(e => e!.Evaluator)
            .FirstOrDefaultAsync(i => i.Id == ideaId);

        if (idea is null) return (null, "Idea not found.", null);

        if (idea.Status != IdeaStatus.Submitted)
            return (null, "Cannot start review. Idea must be in 'Submitted' status.", idea.Status.ToString());

        idea.Status = IdeaStatus.UnderReview;
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (MapToResponse(idea), null, null);
    }

    public async Task<(IdeaResponse? Response, string? Error, string? CurrentStatus)> EvaluateAsync(
        int ideaId, int evaluatorId, EvaluateRequest request)
    {
        var idea = await db.Ideas
            .Include(i => i.Submitter)
            .Include(i => i.Attachment)
            .FirstOrDefaultAsync(i => i.Id == ideaId);

        if (idea is null) return (null, "Idea not found.", null);

        if (idea.Status != IdeaStatus.UnderReview)
            return (null, "Cannot evaluate. Idea must be in 'UnderReview' status before accepting or rejecting.", idea.Status.ToString());

        var evaluation = new Evaluation
        {
            IdeaId = ideaId,
            EvaluatorId = evaluatorId,
            Decision = request.Decision,
            Comment = request.Comment.Trim(),
            DecidedAt = DateTime.UtcNow
        };

        idea.Status = request.Decision == EvaluationDecision.Accepted
            ? IdeaStatus.Accepted
            : IdeaStatus.Rejected;
        idea.UpdatedAt = DateTime.UtcNow;

        db.Evaluations.Add(evaluation);
        await db.SaveChangesAsync();

        var evaluator = await db.Users.FindAsync(evaluatorId);
        evaluation.Evaluator = evaluator!;
        idea.Evaluation = evaluation;

        return (MapToResponse(idea), null, null);
    }

    private static IdeaResponse MapToResponse(Idea idea) => new()
    {
        Id = idea.Id,
        Title = idea.Title,
        Description = idea.Description,
        Category = idea.Category.ToString(),
        Status = idea.Status.ToString(),
        SubmitterName = idea.Submitter.FullName,
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
}
