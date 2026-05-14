using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InnovatEpam.Api.Migrations
{
    /// <inheritdoc />
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
