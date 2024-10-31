using FluentValidation;

namespace ConstructMate.Api;

public class ConstructionDiariesEndpointValidations
{
    public class CreateNewConstructionDiaryRequestValidator : AbstractValidator<CreateNewConstructionDiaryRequest>
    {
        public CreateNewConstructionDiaryRequestValidator()
        {
            RuleFor(r => r.Name).NotNull().NotEmpty();
            RuleFor(r => r.ConstructionManager).NotNull().NotEmpty();
            RuleFor(r => r.ConstructionSupervisor).NotNull().NotEmpty();
            RuleFor(r => r.Address).NotNull().NotEmpty();
            RuleFor(r => r.ConstructionApproval).NotNull().NotEmpty();
            RuleFor(r => r.Investor).NotNull().NotEmpty();
            RuleFor(r => r.Implementer).NotNull().NotEmpty();
        }
    }
}