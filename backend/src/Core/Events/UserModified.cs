namespace ConstructMate.Core.Events;

public record UserModified(Guid Id, string FirstName, string LastName, string Email, string NewToken);
