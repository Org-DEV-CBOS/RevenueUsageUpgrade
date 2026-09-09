using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using RevenuUsage.Application;
using RevenuUsage.Application.Common.Interfaces;
using RevenuUsage.Application.Interfaces;
using RevenuUsage.Domain.Interfaces;
using RevenuUsage.Infrastructure.Persistence;
using RevenuUsage.Infrastructure.Repositories;
using RevenuUsage.Infrastructure.Services;
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
QuestPDF.Settings.License = LicenseType.Community;

// Obligation clients are named in Arabic. If the host is missing a font that covers the
// script, a report should come out with some glyphs boxed rather than not at all.
QuestPDF.Settings.CheckIfAllTextGlyphsAreAvailable = false;

var jwtConfig = builder.Configuration.GetSection("Jwt");
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = jwtConfig["Authority"];
        options.Audience = "ruts.api";
        options.RequireHttpsMetadata = true;
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidateAudience = true,
            ValidAudiences = jwtConfig.GetSection("Audiences").Get<string[]>(),
            ValidateLifetime = true,
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "RUTS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Description = "Enter JWT token"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add CQRS with MediatR
builder.Services.AddApplication();

builder.Services.AddSingleton<InMemoryRevenueUsageStore>();
builder.Services.AddScoped<IRevenueUsageRepository, InMemoryRevenueUsageRepository>();
builder.Services.AddScoped<IRevenueUsageService, RevenueUsageService>();
builder.Services.AddScoped<ITransferRepository, TransferRepository>();
builder.Services.AddScoped<IResourceRepository, ResourceRepository>();
builder.Services.AddScoped<IObligationRepository, ObligationRepository>();
builder.Services.AddScoped<IBeneficiaryRepository, BeneficiaryRepository>();
builder.Services.AddScoped<ICurrencyRepository, CurrencyRepository>();
builder.Services.AddScoped<ILookupRepository, LookupRepository>();
builder.Services.AddScoped<ICorrespondentRepository, CorrespondentRepository>();
builder.Services.AddScoped<ICoverageRepository, CoverageRepository>();
builder.Services.AddScoped<IDealRepository, DealRepository>();
builder.Services.AddScoped<IReserveRepository, ReserveRepository>();
builder.Services.AddScoped<IReportingRepository, ReportingRepository>();
builder.Services.AddScoped<ITransferMetadataRepository, TransferMetadataRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerPathFeature>()?.Error;

        // Navigating away or logging out aborts in-flight requests. SqlClient surfaces that
        // either as OperationCanceledException or as a SqlException with number 0, and the
        // socket is already gone, so there is nobody left to write a response body to.
        if (context.RequestAborted.IsCancellationRequested
            && exception is OperationCanceledException or SqlException { Number: 0 })
        {
            context.Response.StatusCode = 499; // Client Closed Request
            return;
        }

        context.Response.ContentType = "application/json";

        // Stored procedures raise business-rule failures with THROW <50000+>, which arrive
        // as SqlException. Anything below 50000 is a genuine engine fault.
        var isBusinessSqlError = exception is SqlException { Number: >= 50000 };

        var statusCode = exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            InvalidCastException => StatusCodes.Status400BadRequest,
            ArgumentException => StatusCodes.Status400BadRequest,
            _ when isBusinessSqlError => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.StatusCode = statusCode;

        var message = exception switch
        {
            ValidationException validation => string.Join(" ", validation.Errors.Select(e => e.ErrorMessage)),
            _ when isBusinessSqlError => exception!.Message,
            _ when statusCode == StatusCodes.Status400BadRequest => exception?.Message,
            _ => "An unexpected error occurred."
        };

        var response = new
        {
            status = "Error",
            message
        };

        await context.Response.WriteAsJsonAsync(response);
    });
});

app.UseHttpsRedirection();
app.UseCors("AllowAngularDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
