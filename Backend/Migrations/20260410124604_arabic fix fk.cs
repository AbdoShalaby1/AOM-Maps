using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AOM_Maps.Migrations
{
    /// <inheritdoc />
    public partial class arabicfixfk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Media_Countries_CountryARId",
                table: "Media");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_Countries_CountryARId",
                table: "Media",
                column: "CountryARId",
                principalTable: "Countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Media_Countries_CountryARId",
                table: "Media");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_Countries_CountryARId",
                table: "Media",
                column: "CountryARId",
                principalTable: "Countries",
                principalColumn: "Id");
        }
    }
}
