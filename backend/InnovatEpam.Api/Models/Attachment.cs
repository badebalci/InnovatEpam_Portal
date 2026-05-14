using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

public class Attachment
{
    public int Id { get; set; }

    public int IdeaId { get; set; }
    public Idea Idea { get; set; } = null!;

    [Required, MaxLength(260)]
    public string OriginalFileName { get; set; } = string.Empty;

    [Required, MaxLength(512)]
    public string StoragePath { get; set; } = string.Empty;

    [Required, MaxLength(128)]
    public string ContentType { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
