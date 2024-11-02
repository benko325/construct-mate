using FluentValidation;

namespace ConstructMate.Api;

public class ConstructionDiariesEndpointValidations
{
    public class CreateNewConstructionDiaryRequestValidator : AbstractValidator<CreateNewConstructionDiaryRequest>
    {
        public CreateNewConstructionDiaryRequestValidator()
        {
            RuleFor(r => r.DiaryDateFrom).NotNull().NotEmpty();
            RuleFor(r => r.DiaryDateTo).NotNull().NotEmpty();
            RuleFor(r => r.Name).NotNull().NotEmpty();
            RuleFor(r => r.ConstructionManager).NotNull().NotEmpty();
            RuleFor(r => r.ConstructionSupervisor).NotNull().NotEmpty();
            RuleFor(r => r.Address).NotNull().NotEmpty();
            RuleFor(r => r.ConstructionApproval).NotNull().NotEmpty();
            RuleFor(r => r.Investor).NotNull().NotEmpty();
            RuleFor(r => r.Implementer).NotNull().NotEmpty();
            RuleFor(r => r.UpdateConstructionDates).NotNull().NotEmpty();
        }
    }
    
    public class AddNewDiaryContributorRequestValidator : AbstractValidator<AddNewDiaryContributorRequest>
    {
        public AddNewDiaryContributorRequestValidator()
        {
            RuleFor(r => r.ConstructionId).NotNull().NotEmpty();
            RuleFor(r => r.ContributorEmail).NotNull().NotEmpty().EmailAddress();
            RuleFor(r => r.ContributorRole).NotNull().IsInEnum();
        }
    }
    
    public class ModifyDiaryFromToDatesRequestValidator : AbstractValidator<ModifyDiaryFromToDatesRequest>
    {
        public ModifyDiaryFromToDatesRequestValidator()
        {
            RuleFor(r => r.DiaryId).NotNull().NotEmpty();
            RuleFor(r => r.NewDateFrom).NotNull().NotEmpty();
            RuleFor(r => r.NewDateTo).NotNull().NotEmpty();
            RuleFor(r => r.UpdateConstructionDates).NotNull().NotEmpty();
        }
    }
}