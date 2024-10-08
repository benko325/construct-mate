using ConstructMate.Core;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ConstructMate.Infrastructure;

public static class JWTGenerator
{
    /// <summary>
    /// Generates a JWT token for the authenticated user.
    /// </summary>
    /// <param name="user">The authenticated user.</param>
    /// <param name="configuration">Injected IConfiguration from Microsoft</param>
    /// <returns>A JWT token string.</returns>
    public static string GenerateJwtToken(ApplicationUser user, IConfiguration configuration)
    {
        var authClaims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, user.FirstName + " " + user.LastName),
            new Claim(ClaimTypes.Email, user.Email),
            // Add roles as multiple claims if applicable
        };

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            expires: DateTime.UtcNow.AddHours(12),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
