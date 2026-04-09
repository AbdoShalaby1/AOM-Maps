using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AOM_Maps.Migrations
{
    /// <inheritdoc />
    public partial class update2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrencyISO",
                table: "Countries");

            migrationBuilder.DropColumn(
                name: "CurrencyName",
                table: "Countries");

            migrationBuilder.AddColumn<int>(
                name: "CurrencyId",
                table: "Countries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ISO = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Countries_CurrencyId",
                table: "Countries",
                column: "CurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Countries_Currencies_CurrencyId",
                table: "Countries",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Countries_Currencies_CurrencyId",
                table: "Countries");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropIndex(
                name: "IX_Countries_CurrencyId",
                table: "Countries");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Countries");

            migrationBuilder.AddColumn<string>(
                name: "CurrencyISO",
                table: "Countries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CurrencyName",
                table: "Countries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
