using FluentValidation;

namespace ConstructMate.Infrastructure;

public static class PasswordValidator
{
    /// <summary>
    /// This is implementation of helper function for fluentValidation password validation.
    /// Verify password security based on OWASP-ASVS 5.0
    /// Ref: https://github.com/OWASP/ASVS/blob/master/5.0/en/0x11-V2-Authentication.md
    /// </summary>
    /// <param name="password"></param>
    /// <param name="context"></param>
    /// <typeparam name="T"></typeparam>
    public static void Validate<T>(string password, ValidationContext<T> context)
    {
        // If password is empty, it is not needed to be validated
        // If empty password is not allowed, it should be validated by another rule
        if (string.IsNullOrWhiteSpace(password)) return;

        if (password.Length < 6)
        {
            context.AddFailure("Password is too short, it must have at least 6 characters.");
            return;
        }

        if (password.Length > 128)
        {
            context.AddFailure("Password is too long, it must have maximum of 128 characters.");
            return;
        }

        if (!password.Any(char.IsLower))
        {
            context.AddFailure("Password must contain at least one lowercase letter.");
            return;
        }

        if (!password.Any(char.IsUpper))
        {
            context.AddFailure("Password must contain at least one uppercase letter.");
            return;
        }

        if (!password.Any(char.IsDigit))
        {
            context.AddFailure("Password must contain at least one number.");
            return;
        }

        // // Most common passwords list:
        // // https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt
        // var mostCommonPasswords = File.ReadLines(Constants.MostCommonPasswordsFile);
        // if (mostCommonPasswords.Contains(password))
        // {
        //     context.AddFailure("Password is too common.");
        //     return;
        // }
    }
}
