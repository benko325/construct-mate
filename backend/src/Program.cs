using CommunityToolkit.Diagnostics;
using ConstructMate;
using Marten;
using Oakton.Resources;
using Wolverine;
using Wolverine.Marten;
using Wolverine.Http;
using Microsoft.OpenApi.Models;
using Wolverine.FluentValidation;
using Wolverine.Http.FluentValidation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var dbSchemeName = builder.Configuration.GetSection("DbSettings")["DbSchemeName"];
var connectionString = builder.Configuration.GetSection("DbSettings:ConnectionStrings")["MartenDb"];
Guard.IsNotNullOrEmpty(dbSchemeName, "Db scheme");
Guard.IsNotNullOrEmpty(connectionString, "Connection string");

// Adding Marten for persistence
builder.Services.AddMarten(opts =>
{
    opts.Connection(connectionString);
    opts.DatabaseSchemaName = "todo";
})
    .IntegrateWithWolverine();

builder.Services.AddResourceSetupOnStartup();

// Wolverine usage is required for WolverineFx.Http
builder.Host.UseWolverine(opts =>
{
    // This middleware will apply to the HTTP
    // endpoints as well
    opts.Policies.AutoApplyTransactions();

    // Setting up the outbox on all locally handled
    // background tasks
    opts.Policies.UseDurableLocalQueues();
    opts.UseFluentValidation();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen( opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Contruct Mate Api",
        Version = "v1",
    });

    opt.SupportNonNullableReferenceTypes();
});

var app = builder.Build();

app.UseCors();

app.UseSwagger();
app.UseSwaggerUI();

app.MapWolverineEndpoints(opts =>
{
    opts.UseFluentValidationProblemDetailMiddleware();
});

app.UseHttpsRedirection();

app.Run();
