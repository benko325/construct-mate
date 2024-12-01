namespace ConstructMate.Core;

// this enum is created to reflect Slovak law §46d about who can contribute to the construction diary
public enum DiaryContributorRole
{
    None,
    ConstructionManager, // stavbyveduci
    GovernmentalConstructionSupervisor, // statny stavebny dohlad
    Cartographer, // geodet a kartograf
    ConstructionOwner, // stavebník alebo jeho splnomocnený zástupca a vlastník stavby, ak nie je stavebníkom, ??????? ask Brano
    Designer, // projektant
    ConstructionSupplier, // zhotovitel (dodavatel) stavby
    ConstructionControl, // osoba vykonavajuca stavebny dozor
    GovernmentalControl, // osoba vykonavajuca statny dozor
    ConstructionWorkSafetyCoordinator // koordinator bezpecnosti prace na stavenisku
}

public static class DiaryContributorRoleExtensions
{
    private static readonly Dictionary<DiaryContributorRole, string> Translations = new()
    {
        { DiaryContributorRole.None, "Žiadna" },
        { DiaryContributorRole.ConstructionManager, "Stavbyvedúci" },
        { DiaryContributorRole.GovernmentalConstructionSupervisor, "Štátny stavebný dohľad" },
        { DiaryContributorRole.Cartographer, "Geodet a kartograf" },
        { DiaryContributorRole.ConstructionOwner, "Stavebník alebo jeho splnomocnený zástupca a vlastník stavby, ak nie je stavebníkom" },
        { DiaryContributorRole.Designer, "Projektant" },
        { DiaryContributorRole.ConstructionSupplier, "Zhotoviteľ (dodávateľ) stavby" },
        { DiaryContributorRole.ConstructionControl, "Osoba vykonávajúca stavebný dozor" },
        { DiaryContributorRole.GovernmentalControl, "Osoba vykonávajúca štátny dozor" },
        { DiaryContributorRole.ConstructionWorkSafetyCoordinator, "Koordinátor bezpečnosti práce na stavenisku" }
    };

    public static string GetTranslation(this DiaryContributorRole role)
    {
        return Translations.TryGetValue(role, out var translation) ? translation : role.ToString();
    }
}