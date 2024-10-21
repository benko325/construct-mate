namespace ConstructMate.Core.Events.Users;

public record UserModified(Guid Id, string FirstName, string LastName, string Email, string NewToken);
