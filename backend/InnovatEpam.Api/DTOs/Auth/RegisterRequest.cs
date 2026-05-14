using System.ComponentModel.DataAnnotations;
using InnovatEpam.Api.Constants;

namespace InnovatEpam.Api.DTOs.Auth;

public class RegisterRequest
{
    [Required, EmailAddress]
    [EpamEmailDomain]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(200), MinLength(1)]
    public string FullName { get; set; } = string.Empty;

    [Required, MinLength(8)]
    [StrongPassword]
    public string Password { get; set; } = string.Empty;
}

[AttributeUsage(AttributeTargets.Property)]
public class EpamEmailDomainAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is string email && email.EndsWith(AppConstants.EpamEmailDomain, StringComparison.OrdinalIgnoreCase))
            return ValidationResult.Success;

        return new ValidationResult($"Email must be an {AppConstants.EpamEmailDomain} address.");
    }
}

[AttributeUsage(AttributeTargets.Property)]
public class StrongPasswordAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string password)
            return new ValidationResult("Password is required.");

        if (password.Length < 8)
            return new ValidationResult("Password must be at least 8 characters.");

        if (!password.Any(char.IsUpper))
            return new ValidationResult("Password must contain at least one uppercase letter.");

        if (!password.Any(char.IsDigit))
            return new ValidationResult("Password must contain at least one number.");

        return ValidationResult.Success;
    }
}
