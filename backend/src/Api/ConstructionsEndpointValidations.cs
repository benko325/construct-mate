using FluentValidation;

namespace ConstructMate.Api;

public class ConstructionsEndpointValidations
{
    public class CreateConstructionRequestValidator : AbstractValidator<CreateConstructionRequest>
    {
        public CreateConstructionRequestValidator()
        {
            RuleFor(r => r.Name).NotNull().NotEmpty().MinimumLength(1).MaximumLength(64);
            RuleFor(r => r.Description).MaximumLength(512);
        }
    }

    public class ModifyConstructionRequestValidator : AbstractValidator<ModifyConstructionRequest>
    {
        public ModifyConstructionRequestValidator()
        {
            RuleFor(r => r.Id).NotNull().NotEmpty();
            RuleFor(r => r.Name).NotNull().NotEmpty().MinimumLength(1).MaximumLength(64);
            RuleFor(r => r.Description).MaximumLength(512);
        }
    }
}
