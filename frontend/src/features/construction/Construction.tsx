import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import agent from "@/app/api/agent";
import { UUID } from "crypto";
import { Construction, DiaryContributor, DiaryContributorRole, UploadedFile } from "@/app/api/types/responseTypes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import FileUploadForm from "../FileUploadForm";
import FileViewer from "../FileViewer";
import ConfirmationDialog from "../ConfirmationDialog";
import { FaFilePdf } from "react-icons/fa";
import StatusIndicator from "../StatusIndicator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BackButton from "../BackButton";

const apiUrl = import.meta.env.VITE_API_URL + "/" || 'http://localhost:5000/';

const updateConstructionNameDescriptionFormSchema = z.object({
    name: z.string().min(1, { message: 'Názov musí obsahovať aspoň 1 znak' }).max(64, { message: 'Názov musí obsahovať maximálne 64 znakov' }),
    description: z.string().max(512, { message: 'Opis môže mať maximálne 512 znakov' }),
});

type UpdateConstructionNameDescriptionFormData = z.infer<typeof updateConstructionNameDescriptionFormSchema>;

const updateStartEndDateFormSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
}).refine((data) => data.startDate < data.endDate, {message: "Dátum začiatku musí byť skôr ako dátum konca"});
type UpdateStartEndDateFormData = z.infer<typeof updateStartEndDateFormSchema>;

const createNewDiaryFormSchema = z.object({
    diaryDateFrom: z.date(),
    diaryDateTo: z.date(),
    constructionManager: z.string().min(1, { message: 'Meno stavbyvedúceho musí mať aspoň 1 znak' }).max(50, { message: 'Meno stavbyvedúceho musí mať maximálne 50 znakov' }),
    constructionSupervisor: z.string().min(1, { message: 'Meno stavebného dozoru musí mať aspoň 1 znak' }).max(50, { message: 'Meno stavebného dozoru musí mať maximálne 50 znakov' }),
    name: z.string().min(1, { message: 'Názov stavby musí mať aspoň 1 znak' }).max(50, { message: 'Názov stavby musí mať maximálne 50 znakov' }),
    address: z.string().min(1, { message: 'Adresa stavby musí mať aspoň 1 znak' }).max(50, { message: 'Adresa stavby musí mať maximálne 50 znakov' }),
    constructionApproval: z.string().min(1, { message: 'Stavebné povolenie musí mať aspoň 1 znak' }).max(50, { message: 'Stavebné povolenie musí mať maximálne 50 znakov' }),
    investor: z.string().min(1, { message: 'Meno investora musí mať aspoň 1 znak' }).max(50, { message: 'Meno investora musí mať maximálne 50 znakov' }),
    implementer: z.string().min(1, { message: 'Meno realizátora musí mať aspoň 1 znak' }).max(50, { message: 'Meno realizátora musí mať maximálne 50 znakov' }),
    updateConstructionDates: z.boolean().default(false),
}).refine((data) => data.diaryDateFrom < data.diaryDateTo, {message: "Dátum Od musí byť skôr ako dátum Do"});
type CreateNewDiaryFormData = z.infer<typeof createNewDiaryFormSchema>;

const addNewDiaryContributorFormSchema = z.object({
    contributorEmail: z.string().email({ message: "Email musí byť v správnom formáte" }),
    contributorRole: z.nativeEnum(DiaryContributorRole)
        .refine((val) => val !== DiaryContributorRole.None, {
            message: "Rola prispievateľa musí byť vybraná",
        }),
});
type AddNewDiaryContributorFormData = z.infer<typeof addNewDiaryContributorFormSchema>;

const contributorRoleTranslations = {
    [DiaryContributorRole.None]: "Žiadna rola",
    [DiaryContributorRole.ConstructionManager]: "Stavbyvedúci",
    [DiaryContributorRole.GovernmentalConstructionSupervisor]: "Štátny stavebný dozor",
    [DiaryContributorRole.Cartographer]: "Geodet a kartograf",
    [DiaryContributorRole.ConstructionOwner]: "Stavebník alebo vlastník stavby",
    [DiaryContributorRole.Designer]: "Projektant",
    [DiaryContributorRole.ConstructionSupplier]: "Zhotoviteľ stavby",
    [DiaryContributorRole.ConstructionControl]: "Stavebný dozor",
    [DiaryContributorRole.GovernmentalControl]: "Štátny dozor",
    [DiaryContributorRole.ConstructionWorkSafetyCoordinator]: "Koordinátor bezpečnosti práce",
};

export default function ConstructionData() {
    // id of a construction from the url
    const {id} = useParams<{id: UUID}>();
    const safeId = id ?? "00000000-0000-0000-0000-000000000000";

    const [constructionData, setConstructionData] = useState<Construction>();
    const [loading, setLoading] = useState(true);

    const [editNameDescriptionDialogOpen, setEditNameDescriptionDialogOpen] = useState(false);

    const updateConstructionNameDescriptionForm = useForm<UpdateConstructionNameDescriptionFormData>({
        resolver: zodResolver(updateConstructionNameDescriptionFormSchema),
        defaultValues: {
            name: constructionData?.name ?? '',
            description: constructionData?.description ?? '',
        },
    });

    const onSubmitUpdateNameDescription = async (data: UpdateConstructionNameDescriptionFormData) => {
        try {
            const updatedConstructionData = await agent.Construction.updateNameAndDescription(safeId, {
                id: safeId,
                name: data.name,
                description: data.description,
            });
            toast.success("Stavba bola upravená.");

            setConstructionData(prevData => ({
                ...prevData!,
                name: updatedConstructionData.name,
                description: updatedConstructionData.description ?? '',
            }));

            updateConstructionNameDescriptionForm.reset({name: updatedConstructionData.name, description: updatedConstructionData.description});

            setTimeout(() => {
                setEditNameDescriptionDialogOpen(false);
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
                    console.error('Register error from BE validations:', error);
                    updateConstructionNameDescriptionForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Register error:', error);
                    updateConstructionNameDescriptionForm.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown register error:", error);
                    updateConstructionNameDescriptionForm.setError('root', {
                        type: 'manual',
                        message: 'An error occurred. Please try again.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown register error:", error);
                updateConstructionNameDescriptionForm.setError('root', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
        }
    };

    const [editStartEndDateDialogOpen, setEditStartEndDateDialogOpen] = useState(false);

    const updateStartEndDateForm = useForm<UpdateStartEndDateFormData>({
        resolver: zodResolver(updateStartEndDateFormSchema),
        defaultValues: {
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    const onSubmitUpdateStartEndDate = async (data: UpdateStartEndDateFormData) => {
        try {
            const updatedConstructionData = await agent.Construction.updateStartEndDate(safeId, {
                constructionId: safeId,
                startDate: format(data.startDate, 'yyyy-MM-dd'),
                endDate: format(data.endDate, 'yyyy-MM-dd'),
            });
            toast.success("Dátumy boli upravené.");

            setConstructionData(prevData => ({
                ...prevData!,
                startDate: updatedConstructionData.newStartDate,
                endDate: updatedConstructionData.newEndDate,
            }));
            updateStartEndDateForm.reset({startDate: new Date(updatedConstructionData.newStartDate), endDate: new Date(updatedConstructionData.newEndDate)});

            setTimeout(() => {
                setEditStartEndDateDialogOpen(false);
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
                    console.error('Register error from BE validations:', error);
                    updateConstructionNameDescriptionForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Register error:', error);
                    updateConstructionNameDescriptionForm.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown register error:", error);
                    updateConstructionNameDescriptionForm.setError('root', {
                        type: 'manual',
                        message: 'An error occurred. Please try again.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown register error:", error);
                updateConstructionNameDescriptionForm.setError('root', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
        }
    };

    useEffect(() => {
        const fetchConstructionData = async () => {
            try {
                const response = await agent.Construction.getConstructionById(safeId);
                setConstructionData(response);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch construction data:", error);
                setLoading(false);
            }
        };
        fetchConstructionData();
    }, [id]);

    useEffect(() => {
        if (constructionData) {
            updateConstructionNameDescriptionForm.reset({
                name: constructionData.name,
                description: constructionData.description ?? '',
            });

            updateStartEndDateForm.reset({
                startDate: new Date(constructionData.startDate),
                endDate: new Date(constructionData.endDate),
            });

            createNewDiaryForm.reset({
                diaryDateFrom: new Date(constructionData.startDate),
                diaryDateTo: new Date(constructionData.endDate),
            });
        }
    }, [constructionData, updateConstructionNameDescriptionForm, updateStartEndDateForm]);

    const [isDeletePermitConfirmationOpen, setIsDeletePermitConfirmationOpen] = useState(false);
    const onDeleteBuildingPermit = async () => {
        try {
            if (constructionData) {
                await agent.Construction.deleteBuildingPermit(constructionData.id);
                updateField("buildingPermitFileUrl", null);
                toast.success("Stavebné povolenie úspešne vymazané.");
                setTimeout(() => {
                    setIsDeletePermitConfirmationOpen(false);
                }, 2500);
            } else {
                toast.error("Nepodarilo sa načítať dáta o stavbe.");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                if (responseData.ErrorMessage) {
                    console.error('Delete building permit error:', error);
                    toast.error(`${responseData.ErrorMessage}`);
                } else {
                    console.error('Delete building permit error:', error);
                    toast.error("Nastala chyba pri mazaní stavebného povolenia.");
                }
            } else {
                console.error('Delete building permit error:', error);
                toast.error("Nastala neočakávaná chyba pri mazaní stavebného povolenia.");
            }
        }
    }

    const [isDeleteConstructionApprovalConfirmationOpen, setIsDeleteConstructionApprovalConfirmationOpen] = useState(false);
    const onDeleteConstructionApproval = async () => {
        try {
            if (constructionData) {
                await agent.Construction.deleteConstructionApproval(constructionData.id);
                updateField("constructionApprovalFileUrl", null);
                toast.success("Kolaudácia úspešne vymazaná.");
                setTimeout(() => {
                    setIsDeleteConstructionApprovalConfirmationOpen(false);
                }, 2500);
            } else {
                toast.error("Nepodarilo sa načítať dáta o stavbe.");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                if (responseData.ErrorMessage) {
                    console.error('Delete construction approval error:', error);
                    toast.error(`${responseData.ErrorMessage}`);
                } else {
                    console.error('Delete construction approval error:', error);
                    toast.error("Nastala chyba pri mazaní kolaudácie.");
                }
            } else {
                console.error('Delete construction approval error:', error);
                toast.error("Nastala neočakávaná chyba pri mazaní kolaudácie.");
            }
        }
    }

    const [isDeleteConstructionHandoverConfirmationOpen, setIsDeleteConstructionHandoverConfirmationOpen] = useState(false);
    const onDeleteConstructionHandover = async () => {
        try {
            if (constructionData) {
                await agent.Construction.deleteConstructionHandover(constructionData.id);
                updateField("constructionHandoverFileUrl", null);
                toast.success("Odovzdanie stavby úspešne vymazané.");
                setTimeout(() => {
                    setIsDeleteConstructionHandoverConfirmationOpen(false);
                }, 2500);
            } else {
                toast.error("Nepodarilo sa načítať dáta o stavbe.");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                if (responseData.ErrorMessage) {
                    console.error('Delete construction handover error:', error);
                    toast.error(`${responseData.ErrorMessage}`);
                } else {
                    console.error('Delete construction handover error:', error);
                    toast.error("Nastala chyba pri mazaní odovzdania.");
                }
            } else {
                console.error('Delete construction handover error:', error);
                toast.error("Nastala neočakávaná chyba pri mazaní odovzdania.");
            }
        }
    }

    const [uploadProfilePictureDialogOpen, setUploadProfilePictureDialogOpen] = useState(false);

    const updateField = (field: string, value: object | string | null) => {
        setConstructionData((prevState) => ({
            ...prevState!,
            [field]: value,
        }));
    };

    const [uploadBuildingPermitDialogOpen, setUploadBuildingPermitDialogOpen] = useState(false);
    const [isBuildingPermitViewerOpen, setIsBuildingPermitViewerOpen] = useState(false);

    const [uploadConstructionApprovalDialogOpen, setUploadConstructionApprovalDialogOpen] = useState(false);
    const [isConstructionApprovalViewerOpen, setIsConstructionApprovalViewerOpen] = useState(false);

    const [uploadConstructionHandoverDialogOpen, setUploadConstructionHandoverDialogOpen] = useState(false);
    const [isConstructionHandoverViewerOpen, setIsConstructionHandoverViewerOpen] = useState(false);

    const [activeGeneralFile, setActiveGeneralFile] = useState<UploadedFile | null>(null);
    const [activeDeleteGeneralFile, setActiveDeleteGeneralFile] = useState<UploadedFile | null>(null);
    const handleConfirmDeleteGeneralFile = async (fileId: UUID) => {
        if (activeDeleteGeneralFile) {
            try {
                await agent.Construction.deleteGeneralFile(safeId, fileId);
                setConstructionData((prevState) => ({
                    ...prevState!,
                    files: prevState!.files.filter((file) => file.id !== fileId)
                }));
                toast.success("Súbor úspešne vymazaný.");
                setTimeout(() => {
                    setActiveDeleteGeneralFile(null);
                }, 2500);
            } catch (error) {
                if (error instanceof AxiosError) {
                    const responseData = error.response?.data || {};
                    if (responseData.ErrorMessage) {
                        console.error('Delete file error:', error);
                        toast.error(`${responseData.ErrorMessage}`);
                    } else {
                        console.error('Delete file error:', error);
                        toast.error("Nastala chyba pri mazaní súboru.");
                    }
                } else {
                    console.error('Delete file error:', error);
                    toast.error("Nastala neočakávaná chyba pri mazaní súboru.");
                }
            }
        } else {
            console.error('Delete file error - file not selected');
            toast.error("Nastala neočakávaná chyba pri mazaní súboru.");
        }
    };

    const [isUploadGeneralFileDialogOpen, setIsUploadGeneralFileDialogOpen] = useState(false);
    const handleAddGeneralFileToList = (newFile: UploadedFile) => {
        setConstructionData((prevState) => ({
            ...prevState!,
            files: [...prevState!.files, newFile]
        }));
    };

    const navigate = useNavigate();

    const handleOpenDiaryButtonClick = () => {
        navigate(`/construction/${constructionData?.id}/diary/${constructionData?.constructionDiary?.id}`, { state: { constructionDiary: constructionData?.constructionDiary } });
    };

    const handleAddDiaryContributorButtonClick = () => {
        setAddNewDiaryContributorDialogOpen(true);
    };
    const [addNewDiaryContributorDialogOpen, setAddNewDiaryContributorDialogOpen] = useState(false);
    const addNewDiaryContributorForm = useForm<AddNewDiaryContributorFormData>({
        resolver: zodResolver(addNewDiaryContributorFormSchema),
        defaultValues: {
            contributorEmail: "",
            contributorRole: DiaryContributorRole.None
        }
    });

    const onSubmitAddNewDiaryContributor = async (data: AddNewDiaryContributorFormData) => {
        console.log(data);
        try {
            const result = await agent.ConstructionDiary.addNewContributor(safeId, {
                contributorEmail: data.contributorEmail,
                contributorRole: data.contributorRole
            });
            const newContributor: DiaryContributor = {
                contributorId: result.contributorId,
                contributorRole: result.contributorRole
            };

            toast.success("Nový prispievateľ bol úspešne pridaný.");
            setTimeout(() => {
                setConstructionData((prevData) => {
                    if (!prevData || !prevData.constructionDiary) {
                        console.error("ConstructionDiary is not available.");
                        return prevData;
                    }
            
                    const updatedDiary = {
                        ...prevData.constructionDiary,
                        diaryContributors: [...prevData.constructionDiary.diaryContributors, newContributor],
                    };
            
                    return {
                        ...prevData,
                        constructionDiary: updatedDiary,
                    };
                });
                setAddNewDiaryContributorDialogOpen(false);
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
                    console.error('Add new contributor error from BE validations:', error);
                    addNewDiaryContributorForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Add new contributor error:', error);
                    addNewDiaryContributorForm.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown add new contributor error:", error);
                    addNewDiaryContributorForm.setError('root', {
                        type: 'manual',
                        message: 'Nastala chyba. Skúste prosím znova.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown add new contributor error:", error);
                addNewDiaryContributorForm.setError('root', {
                    type: 'manual',
                    message: 'Nastala chyba. Skúste prosím znova.',
                });
            }
        }
    };

    const handleCreateDiaryButtonClick = () => {
        setCreateDiaryDialogOpen(true);
    };

    const [createDiaryDialogOpen, setCreateDiaryDialogOpen] = useState(false);
    const createNewDiaryForm = useForm<CreateNewDiaryFormData>({
        resolver: zodResolver(createNewDiaryFormSchema),
        defaultValues: {
            diaryDateFrom: new Date(),
            diaryDateTo: new Date(),
            constructionManager: "",
            constructionSupervisor: "",
            name: "",
            address: "",
            constructionApproval: "",
            investor: "",
            implementer: "",
            updateConstructionDates: false,
        },
    });

    const onSubmitCreateNewDiary = async (data: CreateNewDiaryFormData) => {
        try {
            const result = await agent.ConstructionDiary.createNew(safeId, {
                diaryDateFrom: format(data.diaryDateFrom, 'yyyy-MM-dd'),
                diaryDateTo: format(data.diaryDateTo, 'yyyy-MM-dd'),
                name: data.name,
                address: data.address,
                constructionManager: data.constructionManager,
                constructionSupervisor: data.constructionSupervisor,
                constructionApproval: data.constructionApproval,
                updateConstructionDates: data.updateConstructionDates,
                investor: data.investor,
                implementer: data.implementer
            });
            updateField("constructionDiary", {
                id: result.id,
                diaryDateFrom: result.diaryDateFrom,
                diaryDateTo: result.diaryDateTo,
                name: result.name,
                address: result.address,
                constructionManager: result.constructionManager,
                constructionSupervisor: result.constructionSupervisor,
                constructionApproval: result.constructionApproval,
                investor: result.investor,
                implementer: result.implementer,
                diaryContributors: result.diaryContributors,
                dailyRecords: result.dailyRecords,
                createdAt: result.createdAt
            });
            if (data.updateConstructionDates) {
                updateField("startDate", data.diaryDateFrom);
                updateField("endDate", data.diaryDateTo);
            }
            toast.success("Nový denník bol úspešne vytvorený.");
            setTimeout(() => {
                setCreateDiaryDialogOpen(false);
            }, 2500);
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                if (responseData.ErrorMessage) {
                    console.error('Create new diary error:', error);
                    toast.error(`${responseData.ErrorMessage}`);
                } else {
                    console.error('Create new diary error:', error);
                    toast.error("Nastala chyba pri vytváraní denníka.");
                }
            } else {
                console.error('Create new diary error:', error);
                toast.error("Nastala neočakávaná chyba pri vytváraní denníka.");
            }
        }
    };

    if (loading) return <div className="text-center">Načítavam údaje o stavbe...</div>;

    if (!constructionData) return (
        <div className="min-h-screen bg-gray-100">
            <div className="text-center">Dáta o danej stavbe neboli nájdené</div>
        </div>
    );
    
    return (
        <div className="relative flex justify-center items-start p-6 bg-gray-100 min-h-screen">
            <BackButton className="absolute top-6 left-6"/>
            <Card className="max-w-4xl w-full p-6">
                <CardHeader className="flex items-center justify-between">
                    <div className="flex items-center w-full">
                        <Avatar className="w-24 h-24 mr-6">
                            <AvatarImage src={apiUrl + constructionData.profilePictureUrl} alt={constructionData.id} />
                            <AvatarFallback>{constructionData.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <CardTitle className="text-2xl font-bold">
                                {constructionData.name}
                            </CardTitle>
                            <p className="text-gray-700 mt-1">{constructionData.description}</p>
                        </div>
                    </div>
                    <div className="flex w-full">
                        <Dialog open={uploadProfilePictureDialogOpen} onOpenChange={setUploadProfilePictureDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-orange-100 hover:bg-orange-50">
                                    Nová fotka
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Nahrajte novú profilovú fotku pre stavbu</DialogTitle>
                                </DialogHeader>
                                <FileUploadForm
                                    uploadFunction={agent.Construction.uploadProfilePicture}
                                    id={safeId}
                                    setDialogOpen={setUploadProfilePictureDialogOpen}
                                    responseFieldValue="newProfilePictureUrl"
                                    updateField={(value) => updateField('profilePictureUrl', value)}
                                    fileFormats="image/jpeg, image/png, image/svg"
                                />
                            </DialogContent>
                        </Dialog>
                        <Dialog open={editNameDescriptionDialogOpen} onOpenChange={setEditNameDescriptionDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50 ml-6">
                                    Upraviť názov a opis
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Upravte názov a opis stavby</DialogTitle>
                                    <DialogDescription>
                                        Upravte názov a opis stavby vyplnením potrebných údajov.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2 py-2">
                                    <Form {...updateConstructionNameDescriptionForm}>
                                        <form onSubmit={updateConstructionNameDescriptionForm.handleSubmit(onSubmitUpdateNameDescription)} className="space-y-6">
                                            <FormField
                                                control={updateConstructionNameDescriptionForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Názov</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Novostavba Myjava" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={updateConstructionNameDescriptionForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Opis (nepovinný)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Novostavba na Staromyjavskej ulici, ..."
                                                            {...field}
                                                            rows={1}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            {updateConstructionNameDescriptionForm.formState.errors.root && (
                                            <div className="text-red-500 text-sm mt-2">
                                                {updateConstructionNameDescriptionForm.formState.errors.root.message}
                                            </div>
                                            )}
                                            <Button type="submit" className="w-full" disabled={updateConstructionNameDescriptionForm.formState.isSubmitting}>
                                                {updateConstructionNameDescriptionForm.formState.isSubmitting ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Prosím počkajte...
                                                    </>
                                                ) : (
                                                    'Upraviť názov a opis stavby'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="mt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="font-medium text-gray-600">Začiatok:</span>
                            <p className="text-gray-800">
                                {format(new Date(constructionData.startDate), "dd.MM.yyyy")}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Koniec:</span>
                            <p className="text-gray-800">
                                {format(new Date(constructionData.endDate), "dd.MM.yyyy")}
                            </p>
                        </div>
                        <Dialog open={editStartEndDateDialogOpen} onOpenChange={setEditStartEndDateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50">
                                    Upraviť dátum začiatku a konca
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Upravte dátum začiatku a konca stavby</DialogTitle>
                                    <DialogDescription>
                                        Upravte dátum začiatku a konca stavby vyplnením potrebných údajov.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2 py-2">
                                    <Form {...updateStartEndDateForm}>
                                        <form onSubmit={updateStartEndDateForm.handleSubmit(onSubmitUpdateStartEndDate)} className="space-y-6">
                                            <FormField
                                                control={updateStartEndDateForm.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Dátum začiatku</FormLabel>
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
                                                control={updateStartEndDateForm.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Dátum konca</FormLabel>
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
                                            {updateStartEndDateForm.formState.errors.root && (
                                            <div className="text-red-500 text-sm mt-2">
                                                {updateStartEndDateForm.formState.errors.root.message}
                                            </div>
                                            )}
                                            <Button type="submit" className="w-full" disabled={updateStartEndDateForm.formState.isSubmitting}>
                                                {updateStartEndDateForm.formState.isSubmitting ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Prosím počkajte...
                                                    </>
                                                ) : (
                                                    'Upraviť dátum začiatku a konca stavby'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="py-8">
                        <StatusIndicator
                            fieldName="Stavebný denník"
                            value={constructionData.constructionDiary}
                            onOpenButtonClick={handleOpenDiaryButtonClick}
                            onCreateButtonClick={handleCreateDiaryButtonClick}
                            valuePresentButtonText="Otvoriť denník"
                            valueNotPresentButtonText="Vytvoriť denník"
                            valuePresentText="Denník bol vytvorený"
                            valueNotPresentText="Denník nebol vytvorený"
                            onModifyValueButtonClick={handleAddDiaryContributorButtonClick}
                            valuePresentModifyButtonText="Pridať nového prispievateľa"
                        />
                        <Dialog open={addNewDiaryContributorDialogOpen} onOpenChange={setAddNewDiaryContributorDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Pridajte nového prispievateľa do denníka</DialogTitle>
                                    <DialogDescription>
                                        Pridajte nového prispievateľa s jeho rolou.<br/>
                                        <b>POZOR! Táto operácia je nevratná.</b>
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-2 py-2">
                                    <Form {...addNewDiaryContributorForm}>
                                        <form onSubmit={addNewDiaryContributorForm.handleSubmit(onSubmitAddNewDiaryContributor)} className="space-y-6">
                                            <FormField
                                                control={addNewDiaryContributorForm.control}
                                                name="contributorEmail"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Email prispievateľa</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="jozko.mrkvicka@mail.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={addNewDiaryContributorForm.control}
                                                name="contributorRole"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Rola prispievateľa</FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                value={field.value?.toString()} // Convert enum to string for Select component
                                                                onValueChange={(val) => field.onChange(Number(val))} // Convert string back to number
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Vyberte rolu prispievateľa">
                                                                        {field.value !== undefined
                                                                            ? contributorRoleTranslations[field.value as DiaryContributorRole]
                                                                            : "Vyberte rolu prispievateľa"}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.entries(contributorRoleTranslations)
                                                                        .filter(([key]) => Number(key) !== DiaryContributorRole.None)
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
                                            {addNewDiaryContributorForm.formState.errors.root && (
                                            <div className="text-red-500 text-sm mt-2">
                                                {addNewDiaryContributorForm.formState.errors.root.message}
                                            </div>
                                            )}
                                            <Button type="submit" className="w-full" disabled={addNewDiaryContributorForm.formState.isSubmitting}>
                                                {addNewDiaryContributorForm.formState.isSubmitting ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Prosím počkajte...
                                                    </>
                                                ) : (
                                                    'Pridať prispievateľa'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={createDiaryDialogOpen} onOpenChange={setCreateDiaryDialogOpen}>
                            <DialogContent className="sm:max-w-[850px]">
                                <DialogHeader>
                                    <DialogTitle>Vytvorte nový denník</DialogTitle>
                                    <DialogDescription>
                                        Vytvorte nový denník vyplnením potrebných údajov. <br/>
                                        <b>POZOR! Denník a zadané informácie (okrem dátumu začiatku a konca) nie je možné ďalej upraviť či vymazať.</b>
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-1 py-1">
                                    <Form {...createNewDiaryForm}>
                                        <form onSubmit={createNewDiaryForm.handleSubmit(onSubmitCreateNewDiary)}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="diaryDateFrom"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Dátum začiatku</FormLabel>
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
                                                    control={createNewDiaryForm.control}
                                                    name="diaryDateTo"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Dátum konca</FormLabel>
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
                                                    control={createNewDiaryForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Názov</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Názov stavby"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Adresa</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Adresa stavby"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="constructionManager"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Stavbyvedúci</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Meno stavbyvedúceho"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="constructionSupervisor"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Stavebný dozor</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Meno stavebného dozoru"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="constructionApproval"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Stavebné povolenie</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Stavebné povolenie"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="investor"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Investor</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Meno (názov) investora"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
                                                    name="implementer"
                                                    render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>Realizátor</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Meno (názov) realizátora"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={createNewDiaryForm.control}
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
                                            </div>
                                            {createNewDiaryForm.formState.errors.root && (
                                            <div className="text-red-500 text-sm mt-2">
                                                {createNewDiaryForm.formState.errors.root.message}
                                            </div>
                                            )}
                                            <Button type="submit" className="w-full mt-4" disabled={createNewDiaryForm.formState.isSubmitting}>
                                                {createNewDiaryForm.formState.isSubmitting ? (
                                                    <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Prosím počkajte...
                                                    </>
                                                ) : (
                                                    'Vytvoriť nový denník'
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="py-4">
                        <h2 className="text-1xl font-semibold text-blue-800">
                            Dôležité súbory k stavbe:
                        </h2>
                        <div className="flex justify-between items-start mt-4">
                            <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
                                <span className="font-medium text-gray-600">Stavebné povolenie:</span>
                                <Dialog open={uploadBuildingPermitDialogOpen} onOpenChange={setUploadBuildingPermitDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-purple-100 hover:bg-purple-50">
                                            Nahrať povolenie
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Nahrajte nové stavebné povolenie</DialogTitle>
                                        </DialogHeader>
                                        <FileUploadForm
                                            uploadFunction={agent.Construction.uploadBuildingPermit}
                                            id={safeId}
                                            setDialogOpen={setUploadBuildingPermitDialogOpen}
                                            responseFieldValue="buildingPermitPath"
                                            updateField={(value) => updateField('buildingPermitFileUrl', value)}
                                            fileFormats="application/pdf"
                                        />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className="bg-black hover:bg-gray-700"
                                    disabled={constructionData.buildingPermitFileUrl == null}
                                    onClick={() => setIsBuildingPermitViewerOpen(true)}
                                >
                                    Otvoriť povolenie
                                </Button>
                                <FileViewer
                                    fileUrl={apiUrl + constructionData.buildingPermitFileUrl}
                                    fileType="pdf"
                                    fileName="Stavebné povolenie"
                                    open={isBuildingPermitViewerOpen}
                                    onClose={() => setIsBuildingPermitViewerOpen(false)}
                                />
                                <Button
                                    disabled={constructionData.buildingPermitFileUrl == null}
                                    className="bg-red-600 hover:bg-red-400"
                                    onClick={() => setIsDeletePermitConfirmationOpen(true)}
                                >
                                    Zmazať povolenie
                                </Button>
                                <ConfirmationDialog
                                    isOpen={isDeletePermitConfirmationOpen}
                                    onClose={() => setIsDeletePermitConfirmationOpen(false)}
                                    onConfirm={onDeleteBuildingPermit}
                                    message="Ste si istý, že chcete vymazať stavebné povolenie?"
                                >
                                </ConfirmationDialog>
                            </div>
                            <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
                                <span className="font-medium text-gray-600">Kolaudácia:</span>
                                <Dialog open={uploadConstructionApprovalDialogOpen} onOpenChange={setUploadConstructionApprovalDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-purple-100 hover:bg-purple-50">
                                            Nahrať dokument
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Nahrajte nový dokument ku kolaudácii</DialogTitle>
                                        </DialogHeader>
                                        <FileUploadForm
                                            uploadFunction={agent.Construction.uploadConstructionApproval}
                                            id={safeId}
                                            setDialogOpen={setUploadConstructionApprovalDialogOpen}
                                            responseFieldValue="constructionApprovalPath"
                                            updateField={(value) => updateField('constructionApprovalFileUrl', value)}
                                            fileFormats="application/pdf"
                                        />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className="bg-black hover:bg-gray-700"
                                    disabled={constructionData.constructionApprovalFileUrl == null}
                                    onClick={() => setIsConstructionApprovalViewerOpen(true)}
                                >
                                    Otvoriť kolaudáciu
                                </Button>
                                <FileViewer
                                    fileUrl={apiUrl + constructionData.constructionApprovalFileUrl}
                                    fileType="pdf"
                                    fileName="Kolaudácia"
                                    open={isConstructionApprovalViewerOpen}
                                    onClose={() => setIsConstructionApprovalViewerOpen(false)}
                                />
                                <Button
                                    disabled={constructionData.constructionApprovalFileUrl == null}
                                    className="bg-red-600 hover:bg-red-400"
                                    onClick={() => setIsDeleteConstructionApprovalConfirmationOpen(true)}
                                >
                                    Zmazať kolaudáciu
                                </Button>
                                <ConfirmationDialog
                                    isOpen={isDeleteConstructionApprovalConfirmationOpen}
                                    onClose={() => setIsDeleteConstructionApprovalConfirmationOpen(false)}
                                    onConfirm={onDeleteConstructionApproval}
                                    message="Ste si istý, že chcete vymazať kolaudáciu?"
                                >
                                </ConfirmationDialog>
                            </div>
                            <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
                                <span className="font-medium text-gray-600">Odovzdanie stavby:</span>
                                <Dialog open={uploadConstructionHandoverDialogOpen} onOpenChange={setUploadConstructionHandoverDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-purple-100 hover:bg-purple-50">
                                            Nahrať dokument
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Nahrajte nový dokument k odovzdaniu stavby</DialogTitle>
                                        </DialogHeader>
                                        <FileUploadForm
                                            uploadFunction={agent.Construction.uploadConstructionHandover}
                                            id={safeId}
                                            setDialogOpen={setUploadConstructionHandoverDialogOpen}
                                            responseFieldValue="constructionHandoverPath"
                                            updateField={(value) => updateField('constructionHandoverFileUrl', value)}
                                            fileFormats="application/pdf"
                                        />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    className="bg-black hover:bg-gray-700"
                                    disabled={constructionData.constructionHandoverFileUrl == null}
                                    onClick={() => setIsConstructionHandoverViewerOpen(true)}
                                >
                                    Otvoriť odovzdanie stavby
                                </Button>
                                <FileViewer
                                    fileUrl={apiUrl + constructionData.constructionHandoverFileUrl}
                                    fileType="pdf"
                                    fileName="Odovzdanie stavby"
                                    open={isConstructionHandoverViewerOpen}
                                    onClose={() => setIsConstructionHandoverViewerOpen(false)}
                                />
                                <Button
                                    disabled={constructionData.constructionHandoverFileUrl == null}
                                    className="bg-red-600 hover:bg-red-400"
                                    onClick={() => setIsDeleteConstructionHandoverConfirmationOpen(true)}
                                >
                                    Zmazať odovzdanie stavby
                                </Button>
                                <ConfirmationDialog
                                    isOpen={isDeleteConstructionHandoverConfirmationOpen}
                                    onClose={() => setIsDeleteConstructionHandoverConfirmationOpen(false)}
                                    onConfirm={onDeleteConstructionHandover}
                                    message="Ste si istý, že chcete vymazať odovzdanie stavby?"
                                >
                                </ConfirmationDialog>
                            </div>
                        </div>
                    </div>
                    <Accordion type="single" collapsible className="mt-6">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Ostatné súbory k stavbe</AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-4">
                                    <Dialog open={isUploadGeneralFileDialogOpen} onOpenChange={setIsUploadGeneralFileDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="bg-purple-100 hover:bg-purple-50"
                                                onClick={() => setIsUploadGeneralFileDialogOpen(true)}
                                            >
                                                Nahrať nový súbor
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Nahrajte nový súbor k stavbe (foto alebo pdf)</DialogTitle>
                                            </DialogHeader>
                                            <FileUploadForm
                                                uploadFunction={agent.Construction.uploadGeneralFile}
                                                id={safeId}
                                                setDialogOpen={setIsUploadGeneralFileDialogOpen}
                                                addUploadedFileToList={handleAddGeneralFileToList}
                                                fileFormats=".pdf,.png,.jpg,.jpeg,.svg"
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    <div className="flex flex-wrap gap-4">
                                        {constructionData.files.map((file) => {
                                            const fileExtension = file.filePath.split('.').pop()?.toLowerCase();
                                            const isPDF = fileExtension === "pdf";
                                            const icon = isPDF
                                            ?
                                            <FaFilePdf className="text-red-500 text-4xl" />
                                            :
                                            <Avatar className="text-gray-500 text-4xl">
                                                <img src={apiUrl + file.filePath} alt={file.name} className="object-cover w-full h-full rounded-lg" />
                                            </Avatar>;

                                            return (
                                                <Card key={file.id} className="min-w-[150px] max-w-[200px] flex flex-col items-center">
                                                    <CardHeader>
                                                        <div className="flex flex-col items-center">
                                                            {icon}
                                                            <CardTitle className="mt-2 text-lg font-medium">{file.name}</CardTitle>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Button 
                                                            variant="outline"
                                                            className="w-full m-1"
                                                            onClick={() => setActiveGeneralFile(file)}
                                                        >
                                                            Zobraziť súbor
                                                        </Button>
                                                        {activeGeneralFile?.id === file.id && (
                                                            <FileViewer
                                                                fileUrl={apiUrl + file.filePath}
                                                                fileType={isPDF ? "pdf" : "image"}
                                                                fileName={file.name}
                                                                open={Boolean(activeGeneralFile)}
                                                                onClose={() => setActiveGeneralFile(null)}
                                                            />
                                                        )}

                                                        <Button
                                                            className="bg-red-600 hover:bg-red-400 w-full m-1"
                                                            onClick={() => setActiveDeleteGeneralFile(file)}
                                                        >
                                                            Zmazať súbor
                                                        </Button>

                                                        {activeDeleteGeneralFile?.id === file.id && (
                                                            <ConfirmationDialog
                                                                isOpen={Boolean(activeDeleteGeneralFile)}
                                                                onClose={() => setActiveDeleteGeneralFile(null)}
                                                                onConfirm={() => handleConfirmDeleteGeneralFile(file.id)}
                                                                message={`Ste si istý, že chcete vymazať súbor ${file.name}?`}
                                                            />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}