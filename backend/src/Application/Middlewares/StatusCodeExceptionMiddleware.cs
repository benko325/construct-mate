using ConstructMate.Core;
using ConstructMate.Infrastructure.StatusCodeGuard;
using System.Text.Json;

namespace ConstructMate.Application.Middlewares;

public class StatusCodeExceptionMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (StatusCodeException ex)
        {
            var response = new ErrorResponse(ex.Message);

            context.Response.StatusCode = ex.StatusCode;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
