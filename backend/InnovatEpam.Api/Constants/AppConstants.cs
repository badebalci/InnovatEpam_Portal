namespace InnovatEpam.Api.Constants;

public static class AppConstants
{
    public const long MaxFileSizeBytes = 10_485_760; // 10 MB

    public static readonly string[] AllowedMimeTypes =
    [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
        "video/mp4",
        "video/quicktime",
        "application/zip",
        "application/x-zip-compressed"
    ];

    public const int MaxAttachmentsPerIdea = 5;

    public const int DefaultPageSize = 20;
    public const int MaxCommentLength = 2000;
    public const string EpamEmailDomain = "@epam.com";
    public const int AccessTokenExpiryMinutes = 60;
    public const int RefreshTokenExpiryDays = 7;
}
