using ConstructMate.Core;
using ConstructMate.Core.Events.Users;
using ConstructMate.Infrastructure.StatusCodeGuard;
using Marten;
using Microsoft.AspNetCore.Identity;

namespace ConstructMate.Application.Commands.Users;

/// <summary>
/// Delete an existing user files command
/// </summary>
/// <param name="Id">Id of user to be deleted</param>
public record DeleteUserFilesCommand(Guid Id);

/// <summary>
/// Delete an existing user files
/// </summary>
public class DeleteUserFilesCommandHandler
{
    public static async Task<ApplicationUser> LoadAsync(DeleteUserFilesCommand userFilesCommand, UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(userFilesCommand.Id.ToString());
        StatusCodeGuard.IsNotNull(user, StatusCodes.Status404NotFound, "User whose files has to be deleted not found");

        return user;
    }

    public static async Task<UserFilesDeleted> Handle(DeleteUserFilesCommand userFilesCommand, ApplicationUser user,
        UserManager<ApplicationUser> userManager, IDocumentSession session, CancellationToken cancellationToken)
    {
        //var result = await userManager.DeleteAsync(user);

        //var errorDescriptions = result.Errors.Select(r => r.Description);
        //var errors = string.Join(" ", errorDescriptions);
        //StatusCodeGuard.IsTrue(result.Succeeded, StatusCodes.Status500InternalServerError, errors); //result.Errors.First().Description ??

        // delete folder with all in it and create an empty new one
        var folderPath = $"{Constants.FilesFolder}/{user.Id}";
        Directory.Delete(folderPath, true);
        Directory.CreateDirectory(folderPath);
        
        var constructions = await session.Query<Construction>()
            .Where(c => c.OwnerId == user.Id)
            .ToListAsync(token: cancellationToken);
        
        session.Delete(constructions);
        await session.SaveChangesAsync(cancellationToken);

        return new UserFilesDeleted(user.Id);
    }
}
