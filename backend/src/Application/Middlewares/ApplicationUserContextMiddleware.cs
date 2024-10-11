using ConstructMate.Application.ServiceInterfaces;
using Wolverine.Http;

namespace ConstructMate.Application.Middlewares;

/// <summary>
/// Middleware for filling up the user context from the claims
/// </summary>
public class ApplicationUserContextMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext context, IApplicationUserContext userContext)
    {
        // If the current user is authenticated, load the user context from the claims
        if (context.User.Identity is { IsAuthenticated: true })
        {
            var claims = context.User.Claims;
            userContext.LoadFromClaims(claims.ToArray());
        }

        // Call the next delegate/middleware in the pipeline
        await _next(context);
    }
}

/// <summary>
/// Middleware for filling up the user context from the claims
/// This is a Wolverine middleware implementation
/// </summary>
public class ApplicationUserContextWolverineMiddleware
{
    public static IResult Before(HttpContext context, IApplicationUserContext userContext)
    {
        // If the current user is authenticated, load the user context from the claims
        if (context.User.Identity is { IsAuthenticated: true })
        {
            var claims = context.User.Claims;
            userContext.LoadFromClaims(claims.ToArray());
        }

        return WolverineContinue.Result();
    }
}