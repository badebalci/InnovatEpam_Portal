using InnovatEpam.Api.Data;
using InnovatEpam.Api.DTOs.Evaluations;
using InnovatEpam.Api.DTOs.Ideas;
using InnovatEpam.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InnovatEpam.Api.Services;

public class EvaluationService(AppDbContext db)
{
    private static readonly IReadOnlyDictionary<IdeaStatus, IdeaStatus> StageProgression =
        new Dictionary<IdeaStatus, IdeaStatus>
        {
            [IdeaStatus.Submitted] = IdeaStatus.InitialReview,
            [IdeaStatus.InitialReview] = IdeaStatus.TechnicalReview,
            [IdeaStatus.TechnicalReview] = IdeaStatus.FinalReview,
        };

    public async Task<(IdeaResponse? Response, string? Error, string? CurrentStatus)> StartReviewAsync(int ideaId)
    {
        var idea = await LoadIdeaAsync(ideaId);
        if (idea is null) return (null, "Idea not found.", null);

        if (idea.Status != IdeaStatus.Submitted)
            return (null, "Cannot start review. Idea must be in 'Submitted' status.", idea.Status.ToString());

        idea.Status = IdeaStatus.InitialReview;
        idea.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (MapToResponse(idea), null, null);
    }

    public async Task<(IdeaResponse? Response, string? Error, string? CurrentStatus)> AdvanceStageAsync(
        int ideaId, int evaluatorId, string comment)
    {
        var idea = await LoadIdeaAsync(ideaId);
        if (idea is null) return (null, "Idea not found.", null);

        if (!StageProgression.TryGetValue(idea.Status, out var nextStatus))
            return (null, $"Cannot advance from '{idea.Status}'. Idea must be in a review stage.", idea.Status.ToString());

        var transition = new StageTransition
        {
            IdeaId = ideaId,
            EvaluatorId = evaluatorId,
            FromStatus = idea.Status,
            ToStatus = nextStatus,
            Comment = comment.Trim(),
            TransitionedAt = DateTime.UtcNow
        };

        idea.Status = nextStatus;
        idea.UpdatedAt = DateTime.UtcNow;

        db.StageTransitions.Add(transition);
        await db.SaveChangesAsync();

        var evaluator = await db.Users.FindAsync(evaluatorId);
        transition.Evaluator = evaluator!;
        idea.StageTransitions.Add(transition);

        return (MapToResponse(idea), null, null);
    }

    public async Task<(IdeaResponse? Response, string? Error, string? CurrentStatus)> RejectAtStageAsync(
        int ideaId, int evaluatorId, string comment)
    {
        var idea = await LoadIdeaAsync(ideaId);
        if (idea is null) return (null, "Idea not found.", null);

        var rejectableStatuses = new[]
        {
            IdeaStatus.Submitted,
            IdeaStatus.InitialReview,
            IdeaStatus.TechnicalReview,
            IdeaStatus.FinalReview,
            IdeaStatus.UnderReview
        };

        if (!rejectableStatuses.Contains(idea.Status))
            return (null, $"Cannot reject idea in '{idea.Status}' status.", idea.Status.ToString());

        var transition = new StageTransition
        {
            IdeaId = ideaId,
            EvaluatorId = evaluatorId,
            FromStatus = idea.Status,
            ToStatus = IdeaStatus.Rejected,
            Comment = comment.Trim(),
            TransitionedAt = DateTime.UtcNow
        };

        idea.Status = IdeaStatus.Rejected;
        idea.UpdatedAt = DateTime.UtcNow;

        db.StageTransitions.Add(transition);
        await db.SaveChangesAsync();

        var evaluator = await db.Users.FindAsync(evaluatorId);
        transition.Evaluator = evaluator!;
        idea.StageTransitions.Add(transition);

        return (MapToResponse(idea), null, null);
    }

    public async Task<(IdeaResponse? Response, string? Error, string? CurrentStatus)> EvaluateAsync(
        int ideaId, int evaluatorId, EvaluateRequest request)
    {
        var idea = await LoadIdeaAsync(ideaId);
        if (idea is null) return (null, "Idea not found.", null);

        var evaluatableStatuses = new[] { IdeaStatus.UnderReview, IdeaStatus.FinalReview };
        if (!evaluatableStatuses.Contains(idea.Status))
            return (null, "Cannot evaluate. Idea must be in 'FinalReview' status before accepting or rejecting.", idea.Status.ToString());

        if (idea.Status == IdeaStatus.FinalReview)
        {
            var scoreValues = new[] { request.ScoreFunctionality, request.ScoreReliability,
                request.ScoreUsability, request.ScoreMaintainability, request.ScoreEfficiency };
            if (scoreValues.Any(s => s < 1 || s > 5))
                return (null, "All dimension scores must be between 1 and 5.", idea.Status.ToString());
        }

        var isFinalReview = idea.Status == IdeaStatus.FinalReview;
        var evaluation = new Evaluation
        {
            IdeaId = ideaId,
            EvaluatorId = evaluatorId,
            Decision = request.Decision,
            Comment = request.Comment.Trim(),
            ScoreFunctionality = isFinalReview ? request.ScoreFunctionality : 0,
            ScoreReliability = isFinalReview ? request.ScoreReliability : 0,
            ScoreUsability = isFinalReview ? request.ScoreUsability : 0,
            ScoreMaintainability = isFinalReview ? request.ScoreMaintainability : 0,
            ScoreEfficiency = isFinalReview ? request.ScoreEfficiency : 0,
            OverallScore = isFinalReview ? Math.Round(
                (request.ScoreFunctionality + request.ScoreReliability +
                 request.ScoreUsability + request.ScoreMaintainability +
                 request.ScoreEfficiency) / 5.0, 1) : 0,
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

    private async Task<Idea?> LoadIdeaAsync(int ideaId) =>
        await db.Ideas
            .Include(i => i.Submitter)
            .Include(i => i.Attachments)
            .Include(i => i.Evaluation)
                .ThenInclude(e => e!.Evaluator)
            .Include(i => i.StageTransitions.OrderBy(st => st.TransitionedAt))
                .ThenInclude(st => st.Evaluator)
            .FirstOrDefaultAsync(i => i.Id == ideaId);

    private static IdeaResponse MapToResponse(Idea idea) => new()
    {
        Id = idea.Id,
        Title = idea.Title,
        Description = idea.Description,
        Category = idea.Category.ToString(),
        Status = idea.Status.ToString(),
        IsBlindReview = idea.IsBlindReview,
        SubmitterId = idea.SubmitterId,
        SubmitterName = idea.Submitter.FullName,
        CreatedAt = idea.CreatedAt,
        UpdatedAt = idea.UpdatedAt,
        Attachments = idea.Attachments?.Select(a => new AttachmentDto
        {
            Id = a.Id,
            FileName = a.OriginalFileName
        }).ToList() ?? [],
        Evaluation = idea.Evaluation is null ? null : new EvaluationDto
        {
            Decision = idea.Evaluation.Decision.ToString(),
            Comment = idea.Evaluation.Comment,
            EvaluatorName = idea.Evaluation.Evaluator.FullName,
            DecidedAt = idea.Evaluation.DecidedAt,
            ScoreFunctionality = idea.Evaluation.ScoreFunctionality,
            ScoreReliability = idea.Evaluation.ScoreReliability,
            ScoreUsability = idea.Evaluation.ScoreUsability,
            ScoreMaintainability = idea.Evaluation.ScoreMaintainability,
            ScoreEfficiency = idea.Evaluation.ScoreEfficiency,
            OverallScore = idea.Evaluation.OverallScore
        },
        StageHistory = idea.StageTransitions
            .OrderBy(st => st.TransitionedAt)
            .Select(st => new StageTransitionDto
            {
                Id = st.Id,
                FromStatus = st.FromStatus.ToString(),
                ToStatus = st.ToStatus.ToString(),
                EvaluatorName = st.Evaluator.FullName,
                Comment = st.Comment,
                TransitionedAt = st.TransitionedAt
            }).ToList()
    };
}

