using System.ComponentModel.DataAnnotations;
using InnovatEpam.Api.Models;

namespace InnovatEpam.Api.DTOs.Ideas;

public class UpdateIdeaRequest
{
    [Required, MaxLength(200), MinLength(1)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(5000), MinLength(1)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public IdeaCategory Category { get; set; }

    /// <summary>When true, changes the draft status to Submitted.</summary>
    public bool Submit { get; set; }

    public List<IFormFile>? NewFiles { get; set; }
}
