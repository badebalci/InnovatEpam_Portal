using InnovatEpam.Api.Models;
using InnovatEpam.Api.Constants;

namespace InnovatEpam.Api.Data;

public static class Seeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Users.Any(u => u.Role == Role.AdminEvaluator))
            return;

        var admin = new User
        {
            Email = "admin@epam.com",
            FullName = "EPAM Admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234"),
            Role = Role.AdminEvaluator,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);
        context.SaveChanges();
    }
}
