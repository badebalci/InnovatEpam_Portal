using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.DTOs.Ideas;

public class StageTransitionRequest
{
    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;
}

public class SetBlindReviewRequest
{
    public bool IsBlindReview { get; set; }
}
