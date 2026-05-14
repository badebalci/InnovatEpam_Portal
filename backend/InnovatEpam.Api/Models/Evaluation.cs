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

    public DateTime DecidedAt { get; set; } = DateTime.UtcNow;
}
