using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

public class RefreshToken
{
    public int Id { get; set; }

    [Required, MaxLength(512)]
    public string Token { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
