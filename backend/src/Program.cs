using CommunityToolkit.Diagnostics;
using Marten;
using Oakton.Resources;
using Wolverine;
using Wolverine.Marten;
using Wolverine.Http;
using Microsoft.OpenApi.Models;
using Wolverine.FluentValidation;
using Wolverine.Http.FluentValidation;
using System.Reflection;
using ConstructMate.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using ConstructMate.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

builder.Services.AddIdentityCore<ApplicationUser>(opts =>
{
    opts.Password.RequireDigit = true;
    opts.Password.RequiredLength = 6;
    opts.Password.RequireNonAlphanumeric = false;
    opts.Password.RequireUppercase = true;
    opts.Password.RequireLowercase = true;

    // Lockout settings (optional)
    opts.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    opts.Lockout.MaxFailedAccessAttempts = 5;
    opts.Lockout.AllowedForNewUsers = true;

    // User settings
    opts.User.RequireUniqueEmail = true;
})
    .AddUserStore<MartenUserStore>() // Register the custom user store
    .AddUserManager<UserManager<ApplicationUser>>()
    .AddSignInManager<SignInManager<ApplicationUser>>()
    //.AddRoles<IdentityRole>()
    .AddDefaultTokenProviders();

// Register UserManager and other Identity services
builder.Services.AddScoped<UserManager<ApplicationUser>>();
builder.Services.AddScoped<IPasswordHasher<ApplicationUser>, PasswordHasher<ApplicationUser>>();
builder.Services.AddScoped<IUserValidator<ApplicationUser>, UserValidator<ApplicationUser>>();
builder.Services.AddScoped<IPasswordValidator<ApplicationUser>, PasswordValidator<ApplicationUser>>();

builder.Services.AddAuthentication(opts =>
{
    opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opts =>
{
    opts.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization();

//builder.Services.AddScoped<IUserStore<User>, MartenUserStore>();
//builder.Services.AddScoped<IRoleStore<IdentityRole>, MartenRoleStore>();

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
        Description = "Api endpoints used to integrate with Counstruct Mate application.",
        Contact = new OpenApiContact()
        {
            Name = "Benjamin Havlik",
            Email = "benko.havlik0@gmail.com"
        }
    });

    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your valid token in the text input below."
    });

    opt.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    opt.IncludeXmlComments(xmlPath);

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

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

app.Run();