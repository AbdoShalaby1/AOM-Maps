using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AOM_Maps.Migrations
{
    /// <inheritdoc />
    public partial class fixedtypo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Discription",
                table: "Landmarks",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Discription",
                table: "History",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Discription",
                table: "Dishes",
                newName: "Description");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Landmarks",
                newName: "Discription");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "History",
                newName: "Discription");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Dishes",
                newName: "Discription");
        }
    }
}
