namespace ConstructMate.Core.Events;

public record UserLoggedIn(string Token, DateTime Expiration);
