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

/*
Validating a token needs the provider's signing keys, which are fetched from the
authority over the network the first time they are needed and refreshed periodically.
That call is the one piece of request handling that reaches outside this process, and
when the authority is slow it fails with "A task was canceled." Left alone the handler
rethrows, so a provider that is merely unreachable arrives as a 500 that reads like a
fault in this API.
*/
static bool IsAuthorityUnreachable(Exception? exception)
{
    for (var current = exception; current is not null; current = current.InnerException)
    {
        if (current is OperationCanceledException or HttpRequestException or IOException)
        {
            return true;
        }
    }

    return false;
}

var jwtConfig = builder.Configuration.GetSection("Jwt");
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = jwtConfig["Authority"];
        options.Audience = "ruts.api";
        options.RequireHttpsMetadata = true;

        // A minute of waiting on an unresponsive authority holds the caller for a minute too.
        options.BackchannelTimeout = TimeSpan.FromSeconds(15);

        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidateAudience = true,
            ValidAudiences = jwtConfig.GetSection("Audiences").Get<string[]>(),
            ValidateLifetime = true,
            RoleClaimType = "role"
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                // A caller that hung up mid-authentication cancels this too. Let that
                // rethrow: the middleware below recognises an abort for what it is.
                if (context.HttpContext.RequestAborted.IsCancellationRequested
                    || !IsAuthorityUnreachable(context.Exception))
                {
                    return Task.CompletedTask;
                }

                // NoResult stops the rethrow. 503 says the token was never judged, which
                // is the truth: a 401 would tell the caller to sign in again for nothing.
                context.NoResult();
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.Headers.RetryAfter = "10";

                context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("Authentication")
                    .LogWarning(context.Exception, "Could not reach the authority at {Authority} to validate a token.", jwtConfig["Authority"]);

                return Task.CompletedTask;
            },

            // Without a principal the request is unauthenticated, and the default answer to
            // that is a 401. Hold on to the 503 set above so the cause is not lost.
            OnChallenge = context =>
            {
                if (context.Response.StatusCode == StatusCodes.Status503ServiceUnavailable)
                {
                    context.HandleResponse();
                }

                return Task.CompletedTask;
            }
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

        // SqlClient reports a cancelled command as a SqlException with number 0 rather than
        // as a cancellation, so it does not reach the middleware below.
        if (context.RequestAborted.IsCancellationRequested && exception is SqlException { Number: 0 })
        {
            context.Response.StatusCode = 499; // Client Closed Request
            return;
        }

        // A cancellation with the caller still connected is not the caller giving up: it is
        // something here running out of time, which is a gateway timeout rather than a fault.
        if (exception is OperationCanceledException)
        {
            context.Response.StatusCode = StatusCodes.Status504GatewayTimeout;
            await context.Response.WriteAsJsonAsync(new { status = "Error", message = "The request took too long and was stopped." });
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

/*
Logging out or navigating away aborts whatever requests were in flight, and every
repository passes the request's token down to Dapper, so the abort surfaces as a
TaskCanceledException. It is the expected outcome of a caller hanging up, not a fault,
so it is caught here, inside the exception handler above: letting it travel any further
would log it at error level and answer a socket that has already gone.
*/
app.Use(async (HttpContext context, RequestDelegate next) =>
{
    try
    {
        await next(context);
    }
    catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
    {
        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = 499; // Client Closed Request
        }
    }
});

app.UseHttpsRedirection();
app.UseCors("AllowAngularDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
