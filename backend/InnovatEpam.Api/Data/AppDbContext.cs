using Microsoft.EntityFrameworkCore;
using InnovatEpam.Api.Models;

namespace InnovatEpam.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        // Idea
        modelBuilder.Entity<Idea>()
            .HasIndex(i => i.SubmitterId);

        modelBuilder.Entity<Idea>()
            .HasIndex(i => i.Status);

        modelBuilder.Entity<Idea>()
            .HasIndex(i => i.Category);

        modelBuilder.Entity<Idea>()
            .Property(i => i.Category)
            .HasConversion<string>();

        modelBuilder.Entity<Idea>()
            .Property(i => i.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Idea>()
            .HasOne(i => i.Submitter)
            .WithMany(u => u.Ideas)
            .HasForeignKey(i => i.SubmitterId)
            .OnDelete(DeleteBehavior.Restrict);

        // Attachment — many per idea
        modelBuilder.Entity<Attachment>()
            .HasIndex(a => a.IdeaId);

        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Idea)
            .WithMany(i => i.Attachments)
            .HasForeignKey(a => a.IdeaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Evaluation — unique one per idea
        modelBuilder.Entity<Evaluation>()
            .HasIndex(e => e.IdeaId)
            .IsUnique();

        modelBuilder.Entity<Evaluation>()
            .Property(e => e.Decision)
            .HasConversion<string>();

        modelBuilder.Entity<Evaluation>()
            .HasOne(e => e.Idea)
            .WithOne(i => i.Evaluation)
            .HasForeignKey<Evaluation>(e => e.IdeaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Evaluation>()
            .HasOne(e => e.Evaluator)
            .WithMany(u => u.Evaluations)
            .HasForeignKey(e => e.EvaluatorId)
            .OnDelete(DeleteBehavior.Restrict);

        // RefreshToken
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
