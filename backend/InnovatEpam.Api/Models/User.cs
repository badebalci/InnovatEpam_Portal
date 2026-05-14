using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    public Role Role { get; set; } = Role.Submitter;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Idea> Ideas { get; set; } = [];
    public ICollection<Evaluation> Evaluations { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
