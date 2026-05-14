using System.ComponentModel.DataAnnotations;
using InnovatEpam.Api.Models;

namespace InnovatEpam.Api.DTOs.Evaluations;

public class EvaluateRequest
{
    [Required]
    public EvaluationDecision Decision { get; set; }

    [Required, MinLength(1), MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    public int ScoreFunctionality { get; set; }
    public int ScoreReliability { get; set; }
    public int ScoreUsability { get; set; }
    public int ScoreMaintainability { get; set; }
    public int ScoreEfficiency { get; set; }
}
