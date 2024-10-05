using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ConstructMate.Core;

public class ApplicationUser : IdentityUser<Guid>
{
    [MaxLength(64)]
    public required string FirstName { get; set; }

    [MaxLength(64)]
    public required string LastName { get; set; }
}
