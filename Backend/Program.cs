using AOM_Maps.Context;
using AOM_Maps.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<SaveCountry>();
builder.Services.AddScoped<FetchCountryService>();
builder.Services.AddScoped<AISummary>();
builder.Services.AddScoped<DownloadMedia>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "React Frontend",
                      policy =>
                      {
                          policy.WithOrigins("https://aom-maps.netlify.app")
                                .WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("React Frontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
