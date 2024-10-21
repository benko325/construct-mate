namespace ConstructMate.Core.Events.Users;

public record UserCreated(Guid Id, string FirstName, string LastName, string Email);
