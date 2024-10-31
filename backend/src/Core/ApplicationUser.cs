using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ConstructMate.Core;

public class ApplicationUser : IdentityUser<Guid>
{
    public required string FirstName { get; set; }
    
    public required string LastName { get; set; }
}
