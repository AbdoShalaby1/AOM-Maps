using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AOM_Maps.Migrations
{
    /// <inheritdoc />
    public partial class arabicfixrelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Media_CountryARId",
                table: "Media",
                column: "CountryARId");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_Countries_CountryARId",
                table: "Media",
                column: "CountryARId",
                principalTable: "Countries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Media_Countries_CountryARId",
                table: "Media");

            migrationBuilder.DropIndex(
                name: "IX_Media_CountryARId",
                table: "Media");
        }
    }
}
