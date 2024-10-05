using ConstructMate.Infrastructure;
using FluentValidation;

namespace ConstructMate.Api;

public class UsersEndpointValidations
{
    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(r => r.FirstName).NotNull().NotEmpty().MinimumLength(1).MaximumLength(64);
            RuleFor(r => r.LastName).NotNull().NotEmpty().MinimumLength(1).MaximumLength(64);
            RuleFor(r => r.Email).NotNull().NotEmpty().EmailAddress();
            RuleFor(r => r.Password).NotNull().NotEmpty().Custom(PasswordValidator.Validate);
            RuleFor(r => r.PasswordAgain).NotNull().NotEmpty().Equal(r => r.Password);
        }
    }

    public class ModifyUserRequestValidator : AbstractValidator<ModifyUserRequest>
    {
        public ModifyUserRequestValidator()
        {
            RuleFor(r => r.Id).NotNull().NotEmpty();
            RuleFor(r => r.NewFirstName).NotNull().NotEmpty().MinimumLength(1).MaximumLength(64);
            RuleFor(r => r.NewLastName).NotNull().NotEmpty().MinimumLength(1).MaximumLength(64);
            RuleFor(r => r.NewEmail).NotNull().NotEmpty().EmailAddress();
        }
    }

    public class CreateNewPasswordRequestValidator : AbstractValidator<ModifyUserPasswordRequest>
    {
        public CreateNewPasswordRequestValidator()
        {
            RuleFor(r => r.Id).NotNull().NotEmpty();
            RuleFor(r => r.OldPassword).NotNull().NotEmpty();
            RuleFor(r => r.NewPassword).NotNull().NotEmpty().Custom(PasswordValidator.Validate);
            RuleFor(r => r.NewPasswordAgain).NotNull().NotEmpty().Equal(r => r.NewPassword);
        }
    }

    public class LoginUserRequestValidator : AbstractValidator<LoginUserRequest>
    {
        public LoginUserRequestValidator()
        {
            RuleFor(r => r.Email).NotNull().NotEmpty().EmailAddress();
            RuleFor(r => r.Password).NotNull().NotEmpty();
        }
    }
}
