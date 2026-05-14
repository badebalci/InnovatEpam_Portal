using InnovatEpam.Api.DTOs.Auth;
using InnovatEpam.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace InnovatEpam.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var (success, error) = await authService.RegisterAsync(request);

        if (!success)
            return Conflict(new { error });

        return StatusCode(201, new { message = "Registration successful. Please log in." });
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { error = "Email and password are required." });

        var (response, refreshToken, error) = await authService.LoginAsync(request);

        if (response is null)
            return Unauthorized(new { error });

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !HttpContext.Request.Host.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase),
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth/refresh",
            MaxAge = TimeSpan.FromDays(7)
        };

        Response.Cookies.Append("refreshToken", refreshToken!, cookieOptions);

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var rawToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(rawToken))
            return Unauthorized(new { error = "Session expired. Please log in again." });

        var (accessToken, error) = await authService.RefreshAsync(rawToken);

        if (accessToken is null)
            return Unauthorized(new { error });

        return Ok(new { accessToken });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var rawToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(rawToken))
            await authService.LogoutAsync(rawToken);

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth/refresh"
        });

        return NoContent();
    }
}
