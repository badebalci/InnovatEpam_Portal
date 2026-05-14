using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using InnovatEpam.Api.Constants;
using InnovatEpam.Api.Data;
using InnovatEpam.Api.DTOs.Auth;
using InnovatEpam.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace InnovatEpam.Api.Services;

public class AuthService(AppDbContext db, IConfiguration configuration)
{
    public async Task<(bool Success, string? Error)> RegisterAsync(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email.ToLowerInvariant()))
            return (false, "An account with this email already exists.");

        var user = new User
        {
            Email = request.Email.ToLowerInvariant(),
            FullName = request.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = Role.Submitter
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(LoginResponse? Response, string? RefreshToken, string? Error)> LoginAsync(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant());

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return (null, null, "Invalid email or password.");

        var accessToken = GenerateAccessToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        var response = new LoginResponse
        {
            AccessToken = accessToken,
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString()
            }
        };

        return (response, refreshToken.Token, null);
    }

    public async Task<(string? AccessToken, string? Error)> RefreshAsync(string rawToken)
    {
        var stored = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == rawToken);

        if (stored is null || stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            return (null, "Session expired. Please log in again.");

        stored.IsRevoked = true;
        var newToken = await CreateRefreshTokenAsync(stored.UserId);
        await db.SaveChangesAsync();

        return (GenerateAccessToken(stored.User), null);
    }

    public async Task LogoutAsync(string rawToken)
    {
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == rawToken);
        if (stored is not null)
        {
            stored.IsRevoked = true;
            await db.SaveChangesAsync();
        }
    }

    private string GenerateAccessToken(User user)
    {
        var secret = configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT secret not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(AppConstants.AccessTokenExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(int userId)
    {
        var token = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(AppConstants.RefreshTokenExpiryDays)
        };

        db.RefreshTokens.Add(token);
        await db.SaveChangesAsync();
        return token;
    }
}
