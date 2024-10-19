namespace ConstructMate.Infrastructure.StatusCodeGuard;

public class StatusCodeException(int statusCode, string message) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
