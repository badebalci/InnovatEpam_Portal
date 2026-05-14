using System.Security.Claims;
using InnovatEpam.Api.DTOs.Evaluations;
using InnovatEpam.Api.DTOs.Ideas;
using InnovatEpam.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InnovatEpam.Api.Controllers;

[ApiController]
[Route("api/ideas")]
[Authorize]
public class IdeasController(IdeaService ideaService, EvaluationService evaluationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetIdeas(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] string? status = null)
    {
        var userId = GetUserId();
        var role = GetRole();
        var result = await ideaService.GetPagedAsync(userId, role, page, pageSize, search, category, status);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetIdea(int id)
    {
        var userId = GetUserId();
        var role = GetRole();

        var (idea, forbidden) = await ideaService.GetByIdAsync(id, userId, role);

        if (forbidden)
            return StatusCode(403, new { error = "Access denied." });

        if (idea is null)
            return NotFound(new { error = "Idea not found." });

        return Ok(idea);
    }

    [HttpPost]
    [Authorize(Roles = "Submitter")]
    public async Task<IActionResult> CreateIdea([FromForm] CreateIdeaRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var userId = GetUserId();
        var (response, errors) = await ideaService.CreateAsync(request, userId);

        if (errors is not null)
            return BadRequest(new { errors });

        return StatusCode(201, response);
    }

    [HttpPatch("{id:int}/review")]
    [Authorize(Roles = "AdminEvaluator")]
    public async Task<IActionResult> StartReview(int id)
    {
        var (response, error, currentStatus) = await evaluationService.StartReviewAsync(id);

        if (response is null)
        {
            if (error == "Idea not found.")
                return NotFound(new { error });
            return Conflict(new { error, currentStatus });
        }

        return Ok(response);
    }

    [HttpPost("{id:int}/evaluate")]
    [Authorize(Roles = "AdminEvaluator")]
    public async Task<IActionResult> Evaluate(int id, [FromBody] EvaluateRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var evaluatorId = GetUserId();
        var (response, error, currentStatus) = await evaluationService.EvaluateAsync(id, evaluatorId, request);

        if (response is null)
        {
            if (error == "Idea not found.")
                return NotFound(new { error });
            return Conflict(new { error, currentStatus });
        }

        return Ok(response);
    }

    [HttpGet("{id:int}/attachment/{attachmentId:int}")]
    public async Task<IActionResult> DownloadAttachment(int id, int attachmentId)
    {
        var userId = GetUserId();
        var role = GetRole();

        var (storagePath, fileName, contentType, forbidden) = await ideaService.GetAttachmentAsync(id, attachmentId, userId, role);

        if (forbidden)
            return StatusCode(403, new { error = "Access denied." });

        if (storagePath is null)
            return NotFound(new { error = "No attachment found for this idea." });

        var fullPath = Path.GetFullPath(storagePath);
        if (!System.IO.File.Exists(fullPath))
            return NotFound(new { error = "No attachment found for this idea." });

        return PhysicalFile(fullPath, contentType!, fileName!);
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? "0");

    private string GetRole() =>
        User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
}
