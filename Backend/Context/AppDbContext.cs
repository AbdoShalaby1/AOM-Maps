using AOM_Maps.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace AOM_Maps.Context
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Country> Countries { get; set; } = null!;

        public DbSet<Dish> Dishes { get; set; } = null!;

        public DbSet<Landmark> Landmarks { get; set; } = null!;

        public DbSet<History> History { get; set; } = null!;

        public DbSet<SportTeam> SportTeams { get; set; } = null!;

        public DbSet<Language> Languages { get; set; } = null!;
        public DbSet<Currency> Currencies { get; set; } = null!;
        public DbSet<CountryMedia> Media { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure cascade delete for all Country relationships
            modelBuilder.Entity<Country>()
                .HasMany(c => c.SportTeams)
                .WithOne(st => st.Country)
                .HasForeignKey(st => st.CountryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Country>()
                .HasMany(c => c.Languages)
                .WithOne(l => l.Country)
                .HasForeignKey(l => l.CountryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Country>()
                .HasMany(c => c.Dishes)
                .WithOne(d => d.Country)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Country>()
                .HasMany(c => c.Landmarks)
                .WithOne(lm => lm.Country)
                .HasForeignKey(lm => lm.CountryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Country>()
                .HasMany(c => c.History)
                .WithOne(h => h.Country)
                .HasForeignKey(h => h.CountryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Country>()
                .HasMany(c => c.Media)
                .WithOne(m => m.Country)
                .HasForeignKey(m => m.CountryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
