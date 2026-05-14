using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InnovatEpam.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEvaluationScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "OverallScore",
                table: "Evaluations",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "ScoreEfficiency",
                table: "Evaluations",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScoreFunctionality",
                table: "Evaluations",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScoreMaintainability",
                table: "Evaluations",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScoreReliability",
                table: "Evaluations",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScoreUsability",
                table: "Evaluations",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OverallScore",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "ScoreEfficiency",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "ScoreFunctionality",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "ScoreMaintainability",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "ScoreReliability",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "ScoreUsability",
                table: "Evaluations");
        }
    }
}
