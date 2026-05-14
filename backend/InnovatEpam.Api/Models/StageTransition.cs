using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

public class StageTransition
{
    public int Id { get; set; }

    public int IdeaId { get; set; }
    public Idea Idea { get; set; } = null!;

    public IdeaStatus FromStatus { get; set; }
    public IdeaStatus ToStatus { get; set; }

    public int EvaluatorId { get; set; }
    public User Evaluator { get; set; } = null!;

    [MaxLength(2000)]
    public string Comment { get; set; } = string.Empty;

    public DateTime TransitionedAt { get; set; } = DateTime.UtcNow;
}
