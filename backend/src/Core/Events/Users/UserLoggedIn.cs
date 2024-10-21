namespace ConstructMate.Core.Events.Users;

public record UserLoggedIn(string Token, DateTime Expiration);
