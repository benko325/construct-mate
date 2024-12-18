import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ConstructionDiary, DailyRecord, DiaryContributorRole } from "../../app/api/types/responseTypes.ts";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from "@/components/ui/textarea.tsx";
import { Loader2 } from "lucide-react";
import { DiaryRecordCategory } from "@/app/api/types/requestTypes.ts";
import agent from "@/app/api/agent.ts";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/input.tsx";
import { format } from "date-fns";
import { UUID } from "crypto";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.tsx";
import BackButton from "../BackButton.tsx";

interface FirstAndLastDayWithRecord {
    firstDay: string | null;
    lastDay: string | null;
};

interface ContributorInfo {
    id: UUID;
    role: DiaryContributorRole;
    name: string;
    email: string;
};

const getRoleName = (role: DiaryContributorRole): string => {
    switch (role) {
        case DiaryContributorRole.None:
            return "Žiadna pozícia";
        case DiaryContributorRole.ConstructionManager:
            return "Stavbyvedúci";
        case DiaryContributorRole.ConstructionSupervisor:
            return "Štátny stavebný dohľad/kontrolná prehliadka stavby";
        case DiaryContributorRole.Surveyor:
            return "Geodet";
        case DiaryContributorRole.ConstructionOwner:
            return "Stavebník alebo vlastník stavby";
        case DiaryContributorRole.Designer:
            return "Generálny projektant/projektant častí projektovej dokumentácie";
        case DiaryContributorRole.ConstructionControl:
            return "Stavebný dozor";
        case DiaryContributorRole.GovernmentalControl:
            return "Štátny dohľad/dozor podľa osobitného predpisu";
        case DiaryContributorRole.ConstructionWorkSafetyCoordinator:
            return "Koordinátor bezpečnosti na stavenisku/autorizovaný bezpečnostný technik/koordinátor projektovej dokumentácie";
        case DiaryContributorRole.ArchitecturalWorkAuthor:
            return "Autor architektonického diela";
        case DiaryContributorRole.Geologist:
            return "Geológ/geotechnik";
        case DiaryContributorRole.PersonAuthorizedByAffectedLegalEntity:
            return "Osoba poverená dotknutou právnickou osobou";
        case DiaryContributorRole.ApartmentBuildingManager:
            return "Správca bytového domu/Predseda spoločenstva vlastníkov bytov a nebytových priestorov";
        case DiaryContributorRole.BuildingInspector:
            return "Stavebný inšpektor/iný zamestnanec stavebného úradu";
        default:
            return "Neznáma pozícia";
    }
};

const newRecordFormSchema = z.object({
    content: z.string()
        .min(10, { message: 'Obsah musí obsahovať aspoň 10 znakov' })
        .max(5000, { message: 'Obsah musí obsahovať maximálne 5000 znakov' }),
    recordCategory: z.nativeEnum(DiaryRecordCategory)
}).refine(schema => schema.recordCategory !== DiaryRecordCategory.None, {
    message: "Kategória musí byť vybraná"
});
type NewRecordFormData = z.infer<typeof newRecordFormSchema>;

const categoryTranslations = {
    [DiaryRecordCategory.None]: "Žiadna kategória",
    [DiaryRecordCategory.Weather]: "Počasie",
    [DiaryRecordCategory.Workers]: "Pracovníci",
    [DiaryRecordCategory.Machines]: "Stroje",
    [DiaryRecordCategory.Work]: "Práca",
    [DiaryRecordCategory.OtherRecords]: "Ostatné záznamy",
};

export default function ConstructionDiaryPage() {
    const [addNewRecordDialogOpen, setAddNewRecordDialogOpen] = useState(false);

    const {diaryId} = useParams<{diaryId: UUID}>(); // diary Id always appears in the route
    const safeDiaryId = diaryId ?? "00000000-0000-0000-0000-000000000000";

    const {constructionId} = useParams<{constructionId: UUID}>(); // construction id is in route in case that the diary is opened by construction owner (construction manager)
    const safeConstructionId = constructionId ?? "00000000-0000-0000-0000-000000000000";

    const location = useLocation();
    const diary : ConstructionDiary | null = location.state?.constructionDiary;
    const [updatedDiary, setUpdatedDiary] = useState<ConstructionDiary | null>(diary);

    const [contributorInfos, setContributorInfos] = useState<ContributorInfo[] | null>(null);
    
    useEffect(() => {
        const fetchContributors = async () => {
            try {
                const response = await agent.ConstructionDiary.getAllContributorsInfo(safeDiaryId);
                const contributorsWithRoleNames = response.map((contributor: ContributorInfo) => ({
                    ...contributor,
                    role: contributor.role as DiaryContributorRole,
                }));
    
                setContributorInfos(contributorsWithRoleNames);
            } catch (error) {
                console.error("Failed to fetch contributors", error);
            }
        };

        fetchContributors();
    }, [diaryId, safeDiaryId]);

    const createModifyFromToDatesFormSchema = (firstLastDayWithRecord: FirstAndLastDayWithRecord | null) => {
        return z
            .object({
                newDateFrom: z
                    .date()
                    .refine(
                        (date) =>
                            !firstLastDayWithRecord?.firstDay ||
                            date <= new Date(firstLastDayWithRecord.firstDay),
                        {
                            message: `Dátum "Od" nesmie byť neskôr ako ${
                                firstLastDayWithRecord?.firstDay ?? "dnes"
                            }`,
                        }
                    ),
                newDateTo: z
                    .date()
                    .refine(
                        (date) =>
                            !firstLastDayWithRecord?.lastDay ||
                            date >= new Date(firstLastDayWithRecord.lastDay),
                        {
                            message: `Dátum "Do" nesmie byť skôr ako ${
                                firstLastDayWithRecord?.lastDay ?? "dnes"
                            }`,
                        }
                    ),
                updateConstructionDates: z.boolean().default(false),
            })
            .refine((data) => data.newDateFrom < data.newDateTo, {
                message: "Dátum Od musí byť skôr ako dátum Do",
            });
    };
    const [firstLastDayWithRecord, setFirstLastDayWithRecord] = useState<FirstAndLastDayWithRecord | null>(null);
    const [modifyFromToDatesFormSchema, setModifyFromToDatesFormSchema] = useState(() => createModifyFromToDatesFormSchema(null)); // Default schema
    useEffect(() => {
        const loadDateRange = async () => {
            try {
                const result = await agent.ConstructionDiary.getFirstAndLastDayWithRecord(safeDiaryId);
                setFirstLastDayWithRecord(result);
                setModifyFromToDatesFormSchema(() => createModifyFromToDatesFormSchema(result));
            } catch (error) {
                console.error("There was an error fetching the data about the first and last day with the record in diary");
            }
        };

        loadDateRange();
    }, [safeDiaryId]);

    // const modifyFromToDatesFormSchema = z.object({
    //     newDateFrom: z.date()
    //     .refine((date) => !firstLastDayWithRecord?.firstDay || date.getDate() <= new Date(firstLastDayWithRecord.firstDay).getDate(), {
    //         message: `Dátum "Od" nesmie byť neskôr ako ${firstLastDayWithRecord?.firstDay}`,
    //     }),
    //     newDateTo: z.date()
    //     .refine((date) => !firstLastDayWithRecord?.lastDay || date.getDate() >= new Date(firstLastDayWithRecord.lastDay).getDate(), {
    //         message: `Dátum "Do" nesmie byť skôr ako ${firstLastDayWithRecord?.lastDay}`
    //     }),
    //     updateConstructionDates: z.boolean().default(false),
    // }).refine((data) => data.newDateFrom < data.newDateTo, {message: "Dátum Od musí byť skôr ako dátum Do"});
    type ModifyFromToDatesFormData = z.infer<typeof modifyFromToDatesFormSchema>;

    const [selectedDate, setSelectedDate] = useState<string>("");
    const [filteredRecord, setFilteredRecord] = useState<DailyRecord | null>(null);

    if (!updatedDiary) {
        return <p className="text-center text-red-500">Denník nie je dostupný.</p>;
    }

    // it will be used in SK, so locale date string is Ok
    const today = new Date().toLocaleDateString('en-CA');

    useEffect(() => {
        if (selectedDate) {
            const record = updatedDiary.dailyRecords.find((r: DailyRecord) => r.date === selectedDate) || null;
            setFilteredRecord(record);
        } else {
            setFilteredRecord(null);
        }
    }, [selectedDate, updatedDiary]);

    useEffect(() => {
        if (updatedDiary?.dailyRecords) {
            const availableDates = updatedDiary.dailyRecords.map((record: DailyRecord) => record.date);
            if (availableDates.includes(today)) {
                setSelectedDate(today);
            } else {
                setSelectedDate(availableDates[0]);
            }
        }
    }, [updatedDiary]);

    const [modifyFromToDatesDialogOpen, setModifyFromToDatesDialogOpen] = useState(false);
    const modifyFromToDatesForm = useForm<ModifyFromToDatesFormData>({
        resolver: zodResolver(modifyFromToDatesFormSchema),
        defaultValues: {
            newDateFrom: new Date(),
            newDateTo: new Date(),
            updateConstructionDates: false,
        }
    });

    const onSubmitModifyFromToDates = async (data: ModifyFromToDatesFormData) => {
        try {
            const result = await agent.ConstructionDiary.modifyFromToDates(safeDiaryId, {
                newDateFrom: format(data.newDateFrom, 'yyyy-MM-dd'),
                newDateTo: format(data.newDateTo, 'yyyy-MM-dd'),
                updateConstructionDates: data.updateConstructionDates
            });

            toast.success("Dátumy boli úspešne zmenené.");
            setTimeout(() => {
                setModifyFromToDatesDialogOpen(false);
                modifyFromToDatesForm.reset({
                    newDateFrom: new Date(result.newDateFrom),
                    newDateTo: new Date(result.newDateTo),
                });
                setUpdatedDiary((prevData) => ({
                    ...prevData!,
                    dailyRecords: result.newDailyRecords,
                    diaryDateFrom: result.newDateFrom,
                    diaryDateTo: result.newDateTo
                }));
            }, 2500);
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                let messages = "";
    
                // validation error - should not happen because of same setting of validator as in BE
                if (responseData.status === 400 &&
                    responseData.errors) {
                    const validationErrors = responseData.errors;
                    Object.keys(validationErrors).forEach((field) => {
                        const message = validationErrors[field][0];
                        messages = messages + "/n" + message;
                    });
                    console.error('Modify dates error from BE validations:', error);
                    modifyFromToDatesForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Modify dates error:', error);
                    modifyFromToDatesForm.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown modify dates error:", error);
                    modifyFromToDatesForm.setError('root', {
                        type: 'manual',
                        message: 'Nastala chyba. Skúste prosím znova.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown modify dates error:", error);
                modifyFromToDatesForm.setError('root', {
                    type: 'manual',
                    message: 'Nastala chyba. Skúste prosím znova.',
                });
            }
        }
    };

    useEffect(() => {
        if (updatedDiary) {
            modifyFromToDatesForm.reset({
                newDateFrom: new Date(updatedDiary.diaryDateFrom),
                newDateTo: new Date(updatedDiary.diaryDateTo),
            });
        }
    }, [updatedDiary, modifyFromToDatesForm]);

    const newRecordForm = useForm<NewRecordFormData>({
        resolver: zodResolver(newRecordFormSchema),
        defaultValues: {
            content: '',
            recordCategory: DiaryRecordCategory.None,
        },
    });

    const onSubmitNewRecord = async (data: NewRecordFormData) => {
        try {
            const response = await agent.ConstructionDiary.addNewRecord(updatedDiary.id, data);
            const newRecord = {
                content: response.content,
                authorName: response.contributorName,
                authorRole: response.contributorRole,
                createdAt: response.createdAt,
                picturePath: ""
            };

            const updatedRecords = updatedDiary.dailyRecords.map((record) => {
                if (record.date === today) {
                    switch (data.recordCategory) {
                        case 1: // Weather
                            return {
                                ...record,
                                weather: [...(record.weather || []), newRecord],
                            };
                        case 2: // Workers
                            return {
                                ...record,
                                workers: [...(record.workers || []), newRecord],
                            };
                        case 3: // Machines
                            return {
                                ...record,
                                machines: [...(record.machines || []), newRecord],
                            };
                        case 4: // Work
                            return {
                                ...record,
                                work: [...(record.work || []), newRecord],
                            };
                        case 5: // Other Records
                            return {
                                ...record,
                                otherRecords: [...(record.otherRecords || []), newRecord],
                            };
                        default:
                            console.error("Invalid record category");
                            return record;
                    }
                }
                return record;
            });
            setUpdatedDiary({ ...updatedDiary, dailyRecords: updatedRecords });
            toast.success("Záznam bol pridaný.");
            setTimeout(() => {
                setAddNewRecordDialogOpen(false);
                newRecordForm.reset();
            }, 2500);
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                let messages = "";
    
                // validation error - should not happen because of same setting of validator as in BE
                if (responseData.status === 400 &&
                    responseData.errors) {
                    const validationErrors = responseData.errors;
                    Object.keys(validationErrors).forEach((field) => {
                        const message = validationErrors[field][0];
                        messages = messages + "/n" + message;
                    });
                    console.error('Add new diary record error from BE validations:', error);
                    newRecordForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Add new diary record error:', error);
                    newRecordForm.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown add new diary record error:", error);
                    newRecordForm.setError('root', {
                        type: 'manual',
                        message: 'Nastala neočakávaná chyba. Prosím skúste to znova.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown add new diary record error:", error);
                newRecordForm.setError('root', {
                    type: 'manual',
                    message: 'Nastala neočakávaná chyba. Prosím skúste to znova.',
                });
            }
        }
    };

    const [isDownloadingLoading, setIsDownloadingLoading] = useState(false);
    const handleExportAndDownload = async () => {
        try {
            setIsDownloadingLoading(true);
            const response = await agent.ConstructionDiary.exportToPdf(safeDiaryId);

            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'dennik-export.pdf'); // File name
            document.body.appendChild(link);
            link.click();
            
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting and downloading the PDF:', error);
        } finally {
            setIsDownloadingLoading(false);
        }
    };

    // not needed probably, it stays just in case...
    const safeFormatDate = (dateString: string | null): string | null => {
        if (!dateString) return null;

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error("Invalid date string:", dateString);
            return null;
        }

        return format(date, "MMMM dd, yyyy HH:mm:ss");
    };

    if (!updatedDiary || !contributorInfos) return (
        <div>
            <p>Načítavam denník...</p>
        </div>
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-start">
                    <BackButton className="w-auto"/>
                </div>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <h1 className="text-2xl underline font-bold text-blue-900">Stavebný denník</h1>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex justify-between items-center border p-6 rounded-md shadow-md">
                                <h2 className="text-lg font-normal">
                                    <i className="underline">Názov:</i> {updatedDiary.name}, <i className="underline">Adresa:</i> {updatedDiary.address}<br/>
                                    <i className="underline">Vytvorený:</i> {safeFormatDate(updatedDiary.createdAt) || "N/A"}
                                </h2>
   
                                <div>
                                    <Button
                                        disabled={isDownloadingLoading}
                                        className="mr-2 bg-black hover:bg-gray-600 text-white"
                                        onClick={handleExportAndDownload}
                                    >
                                        {isDownloadingLoading ? 'Sťahujem...' : 'Stiahnuť PDF'}
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                Zobraziť ďalšie informácie o denníku
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-bold text-blue-900 text-center">
                                                    Ďalšie informácie o denníku
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="p-2 space-y-6 text-gray-800">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start gap-x-4">
                                                        <span className="font-semibold text-gray-700">Stavbyvedúci:</span>
                                                        <span className="text-gray-800">{updatedDiary.constructionManager}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start gap-x-4">
                                                        <span className="font-semibold text-gray-700">Stavebný dozor:</span>
                                                        <span className="text-gray-800">{updatedDiary.constructionSupervisor}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start gap-x-4">
                                                        <span className="font-semibold text-gray-700">Stavebné povolenie:</span>
                                                        <span className="text-gray-800">{updatedDiary.constructionApproval}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start gap-x-4">
                                                        <span className="font-semibold text-gray-700">Investor:</span>
                                                        <span className="text-gray-800">{updatedDiary.investor}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start gap-x-4">
                                                        <span className="font-semibold text-gray-700">Realizátor:</span>
                                                        <span className="text-gray-800">{updatedDiary.implementer}</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <h3 className="text-lg font-bold text-blue-900">
                                                        Prispievatelia
                                                    </h3>
                                                    {contributorInfos.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {contributorInfos.map((contributor) => (
                                                                <li
                                                                    key={contributor.id}
                                                                    className="flex justify-between items-center border rounded-md p-3 bg-gray-50 shadow-sm"
                                                                >
                                                                    <div className="grid grid-cols-3 gap-x-8 w-full text-center">
                                                                        <div>
                                                                            <span className="font-semibold">Meno:</span> {contributor.name}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-semibold">Email:</span> {contributor.email}
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-semibold">Rola:</span> {getRoleName(contributor.role)}
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <div className="text-gray-500 italic">Žiadni prispievatelia nie sú dostupní.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4 w-auto">
                        <div className="flex items-center space-x-4 w-auto">
                            <Label htmlFor="date-selector" className="text-base whitespace-nowrap">Vyberte dátum so záznamami:</Label>
                            <Select value={selectedDate} onValueChange={setSelectedDate}>
                                <SelectTrigger id="date-selector">
                                    <SelectValue placeholder="Vyberte dátum" />
                                </SelectTrigger>
                                <SelectContent>
                                    {updatedDiary.dailyRecords.map((record: DailyRecord) => (
                                        <SelectItem key={record.date} value={record.date}>
                                            {record.date}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-4 ml-4">
                            <div className="flex flex-col">
                                <p className="text-sm">
                                    <strong>Od:</strong> {updatedDiary.diaryDateFrom}
                                </p>
                                <p className="text-sm">
                                    <strong>Do:</strong> {updatedDiary.diaryDateTo}
                                </p>
                            </div>
                        </div>
                        <Button
                            disabled={new Date(today).getDate() < new Date(updatedDiary.diaryDateFrom).getDate() || new Date(today).getDate() > new Date(updatedDiary.diaryDateTo).getDate()}
                            variant="outline" 
                            onClick={() => setSelectedDate(today)}
                        >
                            Dnešný deň
                        </Button>
                    </div>

                    <div>
                        <Dialog open={modifyFromToDatesDialogOpen} onOpenChange={setModifyFromToDatesDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="bg-blue-100 hover:bg-blue-50 mx-2" disabled={safeConstructionId === "00000000-0000-0000-0000-000000000000"}>
                                    Upraviť dátumy "Od" a "Do"
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Upravte v denníku dátumy "Od" a "Do"</DialogTitle>
                                    <DialogDescription>
                                        Aktualizujú sa tým zároveň aj stránky denníka s dennými záznamami.<br/>
                                        <b>Dátum "Od" nemôže byť neskôr ako je prvý záznam v denníku.<br/>
                                        Dátum "Do" nemôže byť skôr ako je posledný záznam v denníku.</b><br/>
                                        <i>Prvý dátum so záznamom: {firstLastDayWithRecord?.firstDay ?? "Žiadny záznam neexistuje"}</i><br/>
                                        <i>Posledný dátum so záznamom: {firstLastDayWithRecord?.lastDay ?? "Žiadny záznam neexistuje"}</i>
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2 py-2">
                                    <Form {...modifyFromToDatesForm}>
                                        <form onSubmit={modifyFromToDatesForm.handleSubmit(onSubmitModifyFromToDates)} className="space-y-6">
                                            <FormField
                                                control={modifyFromToDatesForm.control}
                                                name="newDateFrom"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nový dátum "Od"</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                {...field}
                                                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={modifyFromToDatesForm.control}
                                                name="newDateTo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nový dátum "Do"</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                {...field}
                                                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={modifyFromToDatesForm.control}
                                                name="updateConstructionDates"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Aktualizovať dátumy stavby s dátumami denníka</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="checkbox"
                                                                checked={field.value || false}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                                className="h-10 w-10 accent-blue-500"
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            {modifyFromToDatesForm.formState.errors.root && (
                                            <div className="text-red-500 text-sm mt-2">
                                                {modifyFromToDatesForm.formState.errors.root.message}
                                            </div>
                                            )}
                                            <Button type="submit" className="w-full" disabled={modifyFromToDatesForm.formState.isSubmitting}>
                                                {modifyFromToDatesForm.formState.isSubmitting ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Prosím počkajte...
                                                    </>
                                                ) : (
                                                    'Upraviť dátumy'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={addNewRecordDialogOpen} onOpenChange={setAddNewRecordDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="bg-green-300 hover:bg-green-100 mx-2">
                                    Pridať nový záznam
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Vytvorte nový záznam</DialogTitle>
                                    <DialogDescription>Záznam sa pridá do stránky s dnešným dňom.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2 py-2">
                                    <Form {...newRecordForm}>
                                        <form onSubmit={newRecordForm.handleSubmit(onSubmitNewRecord)} className="space-y-6">
                                            <FormField
                                                control={newRecordForm.control}
                                                name="content"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Názov</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Vyzeralo to takto, dialo sa toto, ..."
                                                            {...field}
                                                            className=""
                                                            rows={1}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={newRecordForm.control}
                                                name="recordCategory"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Kategória záznamu</FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                value={field.value?.toString()} // Convert enum to string for Select component
                                                                onValueChange={(val) => field.onChange(Number(val))} // Convert string back to number
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Vyberte kategóriu">
                                                                        {field.value !== undefined
                                                                            ? categoryTranslations[field.value as DiaryRecordCategory]
                                                                            : "Vyberte kategóriu"}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.entries(categoryTranslations)
                                                                        .filter(([key]) => Number(key) !== DiaryRecordCategory.None)
                                                                        .map(([key, translation]) => (
                                                                            <SelectItem key={key} value={key}>
                                                                                {translation}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {newRecordForm.formState.errors.root && (
                                            <div className="text-red-500 text-sm mt-2">
                                                {newRecordForm.formState.errors.root.message}
                                            </div>
                                            )}
                                            <Button type="submit" className="w-full" disabled={newRecordForm.formState.isSubmitting}>
                                                {newRecordForm.formState.isSubmitting ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Prosím počkajte...
                                                    </>
                                                ) : (
                                                    'Vytvoriť záznam'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {filteredRecord ? (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Denník zo dňa: {filteredRecord.date}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Počasie</h3>
                                        {filteredRecord.weather.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p>Žiadne záznamy o počasí.</p>
                                            </div>
                                        ) : (
                                            filteredRecord.weather.map((item, index) => (
                                                <div key={index} className="p-4 border rounded mb-4">
                                                    <div className="mb-2 pb-2 border-b border-gray-300">
                                                        <p><strong>Obsah:</strong> {item.content}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p>
                                                            <strong>Autor:</strong> {item.authorName}
                                                            {" "}
                                                            <span className="italic text-gray-500">
                                                                ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                            </span>
                                                        </p>
                                                        <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Pracovníci</h3>
                                        {filteredRecord.workers.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p>Žiadne záznamy o pracovníkoch.</p>
                                            </div>
                                        ) : (
                                            filteredRecord.workers.map((item, index) => (
                                                <div key={index} className="p-4 border rounded mb-4">
                                                    <div className="mb-2 pb-2 border-b border-gray-300">
                                                        <p><strong>Obsah:</strong> {item.content}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p>
                                                            <strong>Autor:</strong> {item.authorName}
                                                            {" "}
                                                            <span className="italic text-gray-500">
                                                                ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                            </span>
                                                        </p>
                                                        <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Stroje</h3>
                                        {filteredRecord.machines.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p>Žiadne záznamy o strojoch.</p>
                                            </div>
                                        ) : (
                                            filteredRecord.machines.map((item, index) => (
                                                <div key={index} className="p-4 border rounded mb-4">
                                                    <div className="mb-2 pb-2 border-b border-gray-300">
                                                        <p><strong>Obsah:</strong> {item.content}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p>
                                                            <strong>Autor:</strong> {item.authorName}
                                                            {" "}
                                                            <span className="italic text-gray-500">
                                                                ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                            </span>
                                                        </p>
                                                        <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Práca</h3>
                                        {filteredRecord.work.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p>Žiadne záznamy o práci.</p>
                                            </div>
                                        ) : (
                                            filteredRecord.work.map((item, index) => (
                                                <div key={index} className="p-4 border rounded mb-4">
                                                    <div className="mb-2 pb-2 border-b border-gray-300">
                                                        <p><strong>Obsah:</strong> {item.content}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p>
                                                            <strong>Autor:</strong> {item.authorName}
                                                            {" "}
                                                            <span className="italic text-gray-500">
                                                                ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                            </span>
                                                        </p>
                                                        <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2">
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Ostatné</h3>
                                        {filteredRecord.otherRecords.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p>Žiadne ostatné záznamy.</p>
                                            </div>
                                        ) : (
                                            filteredRecord.otherRecords.map((item, index) => (
                                                <div key={index} className="p-4 border rounded mb-4">
                                                    <div className="mb-2 pb-2 border-b border-gray-300">
                                                        <p><strong>Obsah:</strong> {item.content}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p>
                                                            <strong>Autor:</strong> {item.authorName}
                                                            {" "}
                                                            <span className="italic text-gray-500">
                                                                ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                            </span>
                                                        </p>
                                                        <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-gray-500">Zvoľte dátum pre zobrazenie záznamov.</p>
                )}
            </div>
        </div>
    );
}