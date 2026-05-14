using InnovatEpam.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InnovatEpam.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController(SettingsService settingsService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var blindReviewDefault = await settingsService.GetBlindReviewDefaultAsync();
        return Ok(new { blindReviewDefault });
    }

    [HttpPut]
    [Authorize(Roles = "AdminEvaluator")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        await settingsService.SetBlindReviewDefaultAsync(request.BlindReviewDefault);
        return Ok(new { blindReviewDefault = request.BlindReviewDefault });
    }
}

public class UpdateSettingsRequest
{
    public bool BlindReviewDefault { get; set; }
}
