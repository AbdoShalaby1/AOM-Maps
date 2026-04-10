using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AOM_Maps.Migrations
{
    /// <inheritdoc />
    public partial class arabic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CountryARId",
                table: "Media",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Lang",
                table: "Countries",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Lang_Name",
                table: "Countries",
                columns: new[] { "Lang", "Name" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Countries_Lang_Name",
                table: "Countries");

            migrationBuilder.DropColumn(
                name: "CountryARId",
                table: "Media");

            migrationBuilder.DropColumn(
                name: "Lang",
                table: "Countries");
        }
    }
}
