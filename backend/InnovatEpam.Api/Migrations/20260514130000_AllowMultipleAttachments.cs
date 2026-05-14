using InnovatEpam.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InnovatEpam.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260514130000_AllowMultipleAttachments")]
    public partial class AllowMultipleAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Attachments_IdeaId",
                table: "Attachments");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_IdeaId",
                table: "Attachments",
                column: "IdeaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Attachments_IdeaId",
                table: "Attachments");

            migrationBuilder.CreateIndex(
                name: "IX_Attachments_IdeaId",
                table: "Attachments",
                column: "IdeaId",
                unique: true);
        }
    }
}
