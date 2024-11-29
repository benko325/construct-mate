using ConstructMate.Core;
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
            RuleFor(r => r.Name).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.ConstructionManager).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.ConstructionSupervisor).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.Address).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.ConstructionApproval).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.Investor).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.Implementer).NotNull().NotEmpty()
                .MinimumLength(1).MaximumLength(50);
            RuleFor(r => r.UpdateConstructionDates).NotNull();
        }
    }
    
    public class AddNewDiaryContributorRequestValidator : AbstractValidator<AddNewDiaryContributorRequest>
    {
        public AddNewDiaryContributorRequestValidator()
        {
            RuleFor(r => r.ConstructionId).NotNull().NotEmpty();
            RuleFor(r => r.ContributorEmail).NotNull().NotEmpty().EmailAddress();
            RuleFor(r => r.ContributorRole)
                .IsInEnum()
                .Must(x => x != DiaryContributorRole.None)
                .WithMessage("'Contributor Role' must be a valid value and cannot be None.");
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
    
    public class AddNewDiaryRecordRequestValidator : AbstractValidator<AddNewDiaryRecordRequest>
    {
        public AddNewDiaryRecordRequestValidator()
        {
            RuleFor(r => r.Content).NotNull().NotEmpty().MinimumLength(10).MaximumLength(5000);
            RuleFor(r => r.RecordCategory)
                .IsInEnum()
                .Must(x => x != DiaryRecordCategory.None)
                .WithMessage("'Record Category' must be a valid value and cannot be None.");
        }
    }
}