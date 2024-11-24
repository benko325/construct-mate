import { useParams } from "react-router-dom";
import TopBar from "../TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import agent from "@/app/api/agent";
import { UUID } from "crypto";
import { Construction } from "@/app/api/types/responseTypes";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

const apiUrl = import.meta.env.VITE_API_URL + "/" || 'http://localhost:5000/';

const updateConstructionNameDescriptionFormSchema = z.object({
    name: z.string().min(1, { message: 'Názov musí obsahovať aspoň 1 znak' }).max(64, { message: 'Názov musí obsahovať maximálne 64 znakov' }),
    description: z.string().max(512, { message: 'Opis môže mať maximálne 512 znakov' }),
});

type UpdateConstructionNameDescriptionFormData = z.infer<typeof updateConstructionNameDescriptionFormSchema>;

const updateStartEndDateFormSchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
});

type UpdateStartEndDateFormData = z.infer<typeof updateStartEndDateFormSchema>;

export default function ConstructionData() {
    // id of a construction from the url
    const {id} = useParams<{id: UUID}>();
    const safeId = id ?? "00000000-0000-0000-0000-000000000000";

    const todayDateString = new Date().toLocaleDateString('en-CA');

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
            startDate: new Date(constructionData?.startDate ?? todayDateString) ?? new Date(),
            endDate: new Date(constructionData?.endDate ?? todayDateString) ?? new Date(),
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
            updateStartEndDateForm.reset({startDate: new Date(updatedConstructionData.newStartDate ?? todayDateString), endDate: new Date(updatedConstructionData.newEndDate ?? todayDateString)});

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

    const [uploadProfilePictureDialogOpen, setUploadProfilePictureDialogOpen] = useState(false);

    const updateField = (field: string, value: string) => {
        setConstructionData((prevData) => ({
            ...prevData!,
            [field]: value,
        }));
    };

    const fetchConstructionData = async () => {
        try {
            const response = await agent.Construction.getConstructionById(safeId);
            setConstructionData(response);
            updateConstructionNameDescriptionForm.reset({name: constructionData?.name, description: constructionData?.description ?? ''});
            updateStartEndDateForm.reset({startDate: new Date(constructionData?.startDate ?? todayDateString), endDate: new Date(constructionData?.endDate ?? todayDateString)});
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch construction data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConstructionData();
    }, [id]);

    const [uploadBuildingPermitDialogOpen, setUploadBuildingPermitDialogOpen] = useState(false);
    const [isBuildingPermitViewerOpen, setIsBuildingPermitViewerOpen] = useState(false);

    const [uploadConstructionApprovalDialogOpen, setUploadConstructionApprovalDialogOpen] = useState(false);
    const [isConstructionApprovalViewerOpen, setIsConstructionApprovalViewerOpen] = useState(false);

    const [uploadConstructionHandoverDialogOpen, setUploadConstructionHandoverDialogOpen] = useState(false);
    const [isConstructionHandoverViewerOpen, setIsConstructionHandoverViewerOpen] = useState(false);

    if (loading) return <div className="text-center">Načítavam údaje o stavbe...</div>;
    if (!constructionData) return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />
            <div className="text-center">Dáta o danej stavbe neboli nájdené</div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />
            <div className="flex justify-center items-start p-6 bg-gray-100 min-h-screen">
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
                                            Upravte názov a opis stavby vyplnením potrebných údajov. <br />
                                            Kliknite "Upraviť názov a opis stavby" pre upravenie.
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
                                                                className=""
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
                                            Upravte dátum začiatku a konca stavby vyplnením potrebných údajov. <br />
                                            Kliknite "Upraviť dátum začiatku a konca stavby" pre upravenie.
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
                        <h2 className="mt-10 text-1xl font-semibold text-blue-800">
                            Dôležité súbory k stavbe:
                        </h2>
                        <div className="flex justify-between items-start mt-4">
                            <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
                                <span className="font-medium text-gray-600">Stavebné povolenie:</span>
                                <Dialog open={uploadBuildingPermitDialogOpen} onOpenChange={setUploadBuildingPermitDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-purple-100 hover:bg-orange-50">
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
                                <Button onClick={() => setIsBuildingPermitViewerOpen(true)}>Otvoriť povolenie</Button>
                                <FileViewer
                                    fileUrl={apiUrl + constructionData.buildingPermitFileUrl}
                                    fileType="pdf"
                                    fileName="Stavebné povolenie"
                                    open={isBuildingPermitViewerOpen}
                                    onClose={() => setIsBuildingPermitViewerOpen(false)}
                                />
                            </div>
                            <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
                                <span className="font-medium text-gray-600">Kolaudácia:</span>
                                <Dialog open={uploadConstructionApprovalDialogOpen} onOpenChange={setUploadConstructionApprovalDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-purple-100 hover:bg-orange-50">
                                            Nahrať dokumenty
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Nahrajte nové dokumenty ku kolaudácii</DialogTitle>
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
                                <Button onClick={() => setIsConstructionApprovalViewerOpen(true)}>Otvoriť kolaudáciu</Button>
                                <FileViewer
                                    fileUrl={apiUrl + constructionData.constructionApprovalFileUrl}
                                    fileType="pdf"
                                    fileName="Kolaudácia"
                                    open={isConstructionApprovalViewerOpen}
                                    onClose={() => setIsConstructionApprovalViewerOpen(false)}
                                />
                            </div>
                            <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
                                <span className="font-medium text-gray-600">Odovzdanie stavby:</span>
                                <Dialog open={uploadConstructionHandoverDialogOpen} onOpenChange={setUploadConstructionHandoverDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="bg-purple-100 hover:bg-orange-50">
                                            Nahrať dokumenty
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Nahrajte nové dokumenty k odovzdaniu stavby</DialogTitle>
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
                                <Button onClick={() => setIsConstructionHandoverViewerOpen(true)}>Otvoriť odovzdanie stavby</Button>

                                <FileViewer
                                    fileUrl={apiUrl + constructionData.constructionHandoverFileUrl}
                                    fileType="pdf"
                                    fileName="Odovzdanie stavby"
                                    open={isConstructionHandoverViewerOpen}
                                    onClose={() => setIsConstructionHandoverViewerOpen(false)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}