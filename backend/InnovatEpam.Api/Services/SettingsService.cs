using InnovatEpam.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace InnovatEpam.Api.Services;

public class SettingsService(AppDbContext db)
{
    public const string BlindReviewDefaultKey = "BlindReviewDefault";

    public async Task<bool> GetBlindReviewDefaultAsync()
    {
        var setting = await db.AppSettings
            .FirstOrDefaultAsync(s => s.Key == BlindReviewDefaultKey);
        return setting?.Value == "true";
    }

    public async Task SetBlindReviewDefaultAsync(bool enabled)
    {
        var setting = await db.AppSettings
            .FirstOrDefaultAsync(s => s.Key == BlindReviewDefaultKey);

        if (setting is null)
        {
            db.AppSettings.Add(new Models.AppSetting
            {
                Key = BlindReviewDefaultKey,
                Value = enabled ? "true" : "false"
            });
        }
        else
        {
            setting.Value = enabled ? "true" : "false";
        }

        await db.SaveChangesAsync();
    }
}
