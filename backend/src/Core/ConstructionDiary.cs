namespace ConstructMate.Core;

public class ConstructionDiary
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateOnly DiaryDateFrom { get; set; }
    public DateOnly DiaryDateTo { get; set; } //datumy na zaklade ktorych sa vytvoria "stranky" v denniku
    public required string ConstructionManager { get; set; } //stavbyveduci
    public required string ConstructionSupervisor { get; set; } //stavebny dozor
    public required string Name { get; set; } //nazov
    public required string Address { get; set; } //presna adresa alebo priblizna
    public required string ConstructionApproval { get; set; } //stavebne povolenie
    public required string Investor { get; set; } //investor
    public required string Implementer { get; set; } //realizator
    public List<DiaryContributor> DiaryContributors { get; set; } = [];
    public List<DailyRecord> DailyRecords { get; set; } = [];
}

public class DiaryContributor
{
    public Guid ContributorId { get; set; }
    // if enum too hard on FE, change back to string
    public required DiaryContributorRole ContributorRole { get; set; }
}

public class DailyRecord
{
    public DateOnly Date { get; set; }
    public List<DiaryRecord> Weather { get; set; } = [];
    public List<DiaryRecord> Workers { get; set; } = [];
    public List<DiaryRecord> Machines { get; set; } = [];
    public List<DiaryRecord> Work { get; set; } = [];
    public List<DiaryRecord> OtherRecords { get; set; } = [];
}

// governmental control will be as diary record written by person of relevant type
// record has Content or PicturePath
public class DiaryRecord
{
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now; // local time
    public required string AuthorName { get; set; }
    public DiaryContributorRole AuthorRole { get; set; }
    public string? PicturePath { get; set; }
}
