namespace ConstructMate.Core;

// this enum is created to reflect Slovak law 201/2022 Z. z. §28 about who can contribute to the construction diary
public enum DiaryContributorRole
{
    None,
    ConstructionManager, // stavbyveduci
    ConstructionSupervisor, // f) osoba vykonávajúca štátny stavebný dohľad alebo kontrolnú prehliadku stavby
    Surveyor, // c) geodet
    ConstructionOwner, // b) stavebník a vlastník stavby, ak nie je stavebníkom
    Designer, // a) generálny projektant a projektant častí projektovej dokumentácie
    BuildingInspector, // e) stavebny inšpektor alebo iny zamestnanec stavebného úradu
    ConstructionControl, // d) osoba vykonavajuca stavebny dozor
    GovernmentalControl, // l) oprávnena osoba orgánu vykonávajúceho štátny dohľad alebo dozor podľa osobitného predpisu
    ConstructionWorkSafetyCoordinator, // g) koordinátor projektovej dokumentácie, autorizovany bezpečnostny technik a koordinátor bezpečnosti na stavenisku
    ArchitecturalWorkAuthor, // h) autor architektonického diela pri výkone autorského dohľadu
    Geologist, // i) geolog a geotechnik
    PersonAuthorizedByAffectedLegalEntity, // k) osoba poverena dotknutou právnickou osobou
    ApartmentBuildingManager, // j) správca bytového domu alebo predseda spoločenstva vlastníkov bytov a nebytových priestorov, ak ide o zmenu stavby, o stavebnú úpravu alebo o údržbu bytového domu
}

public static class DiaryContributorRoleExtensions
{
    private static readonly Dictionary<DiaryContributorRole, string> Translations = new()
    {
        { DiaryContributorRole.None, "Žiadna" },
        { DiaryContributorRole.ConstructionManager, "Stavbyvedúci" },
        { DiaryContributorRole.ConstructionSupervisor, "Štátny stavebný dohľad/kontrolná prehliadka stavby" },
        { DiaryContributorRole.Surveyor, "Geodet" },
        { DiaryContributorRole.ConstructionOwner, "Stavebník alebo vlastník stavby" },
        { DiaryContributorRole.Designer, "Generálny projektant/projektant častí projektovej dokumentácie" },
        { DiaryContributorRole.ConstructionControl, "Stavebný dozor" },
        { DiaryContributorRole.GovernmentalControl, "Štátny dohľad/dozor podľa osobitného predpisu" },
        { DiaryContributorRole.ConstructionWorkSafetyCoordinator, "Koordinátor bezpečnosti na stavenisku/autorizovaný bezpečnostný technik/koordinátor projektovej dokumentácie" },
        { DiaryContributorRole.ArchitecturalWorkAuthor, "Autor architektonického diela" },
        { DiaryContributorRole.Geologist, "Geológ/geotechnik" },
        { DiaryContributorRole.PersonAuthorizedByAffectedLegalEntity, "Osoba poverená dotknutou právnickou osobou"},
        { DiaryContributorRole.ApartmentBuildingManager, "Správca bytového domu/Predseda spoločenstva vlastníkov bytov a nebytových priestorov" },
        { DiaryContributorRole.BuildingInspector, "Stavebný inšpektor/iný zamestnanec stavebného úradu" }
    };

    public static string GetTranslation(this DiaryContributorRole role)
    {
        return Translations.TryGetValue(role, out var translation) ? translation : role.ToString();
    }
}