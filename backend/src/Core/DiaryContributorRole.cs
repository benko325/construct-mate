namespace ConstructMate.Core;

// this enum is created to reflect Slovak law §46d about who can contribute to the construction diary
public enum DiaryContributorRole
{
    GovernmentalConstructionSupervisor, // statny stavebny dohlad
    Cartographer, // geodet a kartograf
    ConstructionOwner, // stavebník alebo jeho splnomocnený zástupca a vlastník stavby, ak nie je stavebníkom, ??????? ask Brano
    Designer, // projektant
    ConstructionSupplier, // zhotovitel (dodavatel) stavby
    ConstructionControl, // osoba vykonavajuca stavebny dozor
    GovernmentalControl, // osoba vykonavajuca statny dozor
    ConstructionWorkSafetyCoordinator // koordinator bezpecnosti prace na stavenisku
}