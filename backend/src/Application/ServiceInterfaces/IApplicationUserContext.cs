using System.Security.Claims;

namespace ConstructMate.Application.ServiceInterfaces;

public interface IApplicationUserContext
{
    Guid UserId { get; }
    string UserName { get; }
    string UserEmail { get; }
    void LoadFromClaims(Claim[] claims);
}
