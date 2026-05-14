using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

public class Idea
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(5000)]
    public string Description { get; set; } = string.Empty;

    public IdeaCategory Category { get; set; }

    public IdeaStatus Status { get; set; } = IdeaStatus.Submitted;

    public int SubmitterId { get; set; }
    public User Submitter { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Attachment? Attachment { get; set; }
    public Evaluation? Evaluation { get; set; }
}
