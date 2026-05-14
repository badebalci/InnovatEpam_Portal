namespace InnovatEpam.Api.DTOs.Ideas;

public class IdeaResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int SubmitterId { get; set; }
    public string SubmitterName { get; set; } = string.Empty;
    public bool IsBlindReview { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<AttachmentDto> Attachments { get; set; } = [];
    public EvaluationDto? Evaluation { get; set; }
    public List<StageTransitionDto> StageHistory { get; set; } = [];
}

public class IdeaSummaryResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string SubmitterName { get; set; } = string.Empty;
    public bool IsBlindReview { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class IdeaListResponse
{
    public IEnumerable<IdeaSummaryResponse> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class AttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
}

public class EvaluationDto
{
    public string Decision { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string EvaluatorName { get; set; } = string.Empty;
    public DateTime DecidedAt { get; set; }
}

public class StageTransitionDto
{
    public int Id { get; set; }
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;
    public string EvaluatorName { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime TransitionedAt { get; set; }
}
