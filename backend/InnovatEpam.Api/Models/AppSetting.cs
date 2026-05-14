using System.ComponentModel.DataAnnotations;

namespace InnovatEpam.Api.Models;

/// <summary>Stores simple application-wide key/value settings.</summary>
public class AppSetting
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Value { get; set; } = string.Empty;
}
