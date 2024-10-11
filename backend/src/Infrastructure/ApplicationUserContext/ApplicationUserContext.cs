using CommunityToolkit.Diagnostics;
using ConstructMate.Application.ServiceInterfaces;
using System.Security.Claims;

namespace ConstructMate.Infrastructure.ApplicationUserContext;

public class ApplicationUserContext : IApplicationUserContext
{
    /// <summary>
    /// Authorized user's Id
    /// </summary>
    public Guid UserId { get; private set; } = Guid.NewGuid();

    /// <summary>
    /// Authorized user's name (first name + last name)
    /// </summary>
    public string UserName { get; private set; } = "";

    /// <summary>
    /// Authorized user's email
    /// </summary>
    public string UserEmail { get; private set; } = "";

    public void LoadFromClaims(Claim[] claims)
    {
        var fakeId = UserId;

        foreach (var claim in claims)
        {
            switch (claim.Type)
            {
                case ClaimTypes.NameIdentifier:
                    UserId = Guid.Parse(claim.Value);
                    break;
                case ClaimTypes.Email:
                    UserEmail = claim.Value;
                    break;
                case ClaimTypes.Name:
                    UserName = claim.Value;
                    break;
            }
        }

        Guard.IsNotEqualTo(fakeId, UserId, "User Id not found in claims");
        Guard.IsNotEmpty(UserEmail, "User email not found in claims");
        Guard.IsNotEmpty(UserName, "User name not found in claims");
    }
}
