namespace ConstructMate.Core.Events;

public record UserCreated(Guid Id, string FirstName, string LastName, string Email);
