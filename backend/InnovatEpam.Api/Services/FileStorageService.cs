using InnovatEpam.Api.Constants;

namespace InnovatEpam.Api.Services;

public class FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
{
    private readonly string _uploadRoot = configuration["UploadPath"] ?? "uploads";

    public (bool Valid, string? Error) ValidateFile(IFormFile file)
    {
        if (file.Length > AppConstants.MaxFileSizeBytes)
            return (false, "File exceeds the maximum allowed size of 10 MB.");

        if (!AppConstants.AllowedMimeTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            return (false, "File type not supported. Allowed: PDF, DOCX, PNG, JPG.");

        return (true, null);
    }

    public async Task<string> SaveAsync(IFormFile file, int ideaId)
    {
        var dir = Path.Combine(_uploadRoot, ideaId.ToString());
        Directory.CreateDirectory(dir);

        var safeFileName = Path.GetFileName(file.FileName);
        var dest = Path.Combine(dir, safeFileName);

        await using var stream = File.Create(dest);
        await file.CopyToAsync(stream);

        logger.LogInformation("Saved attachment for idea {IdeaId}: {FileName}", ideaId, safeFileName);
        return dest;
    }

    public string? GetFilePath(string storagePath)
    {
        if (File.Exists(storagePath))
            return storagePath;

        return null;
    }
}
