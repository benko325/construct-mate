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
}
