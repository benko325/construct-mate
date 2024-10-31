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

    public class AddNewDiaryContributorRequestValidator : AbstractValidator<AddNewDiaryContributorRequest>
    {
        public AddNewDiaryContributorRequestValidator()
        {
            RuleFor(r => r.ConstructionId).NotNull().NotEmpty();
            RuleFor(r => r.ContributorEmail).NotNull().NotEmpty().EmailAddress();
            RuleFor(r => r.ContributorRole).NotNull().NotEmpty().MinimumLength(1);
        }
    }

    public class ModifyConstructionStartEndDateRequestValidator : AbstractValidator<ModifyConstructionStartEndDateRequest>
    {
        public ModifyConstructionStartEndDateRequestValidator()
        {
            RuleFor(r => r.ConstructionId).NotNull().NotEmpty();
            RuleFor(r => r.StartDate).NotNull().NotEmpty();
            RuleFor(r => r.EndDate).NotNull().NotEmpty();
        }
    }
}
