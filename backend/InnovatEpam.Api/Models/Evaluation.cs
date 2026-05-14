using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

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

    /// <summary>Does the idea provide necessary features? (1–5)</summary>
    [Range(1, 5)]
    public int ScoreFunctionality { get; set; }

    /// <summary>Can it function without failure? (1–5)</summary>
    [Range(1, 5)]
    public int ScoreReliability { get; set; }

    /// <summary>How easily can users learn and use it? (1–5)</summary>
    [Range(1, 5)]
    public int ScoreUsability { get; set; }

    /// <summary>How easily can it be modified/updated? (1–5)</summary>
    [Range(1, 5)]
    public int ScoreMaintainability { get; set; }

    /// <summary>How efficiently does it use resources? (1–5)</summary>
    [Range(1, 5)]
    public int ScoreEfficiency { get; set; }

    /// <summary>Average of all five dimensions, rounded to 1 decimal place.</summary>
    public double OverallScore { get; set; }

    public DateTime DecidedAt { get; set; } = DateTime.UtcNow;
}
