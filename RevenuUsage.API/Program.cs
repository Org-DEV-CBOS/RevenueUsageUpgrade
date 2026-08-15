using Microsoft.AspNetCore.Diagnostics;
using RevenuUsage.Application;
using RevenuUsage.Application.Interfaces;
using RevenuUsage.Domain.Interfaces;
using RevenuUsage.Infrastructure.Persistence;
using RevenuUsage.Infrastructure.Repositories;
using RevenuUsage.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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
        context.Response.ContentType = "application/json";
        var exception = context.Features.Get<IExceptionHandlerPathFeature>()?.Error;

        // Determine Status Code
        var statusCode = exception switch
        {
            InvalidCastException => StatusCodes.Status400BadRequest,
            ArgumentException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.StatusCode = statusCode;

        var response = new
        {
            status = "Error",
            message = exception?.Message
        };

        await context.Response.WriteAsJsonAsync(response);
    });
});

app.UseHttpsRedirection();
app.UseCors("AllowAngularDev");
app.MapControllers();

app.Run();
