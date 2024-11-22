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
import { toast, ToastContainer } from "react-toastify";
import { AxiosError } from "axios";

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
            await agent.Construction.updateNameAndDescription(safeId, {
                id: safeId,
                name: data.name,
                description: data.description,
            });
            toast.success("Stavba bola upravená.");
            setTimeout(() => {
                setEditNameDescriptionDialogOpen(false);
                window.location.href = window.location.href;
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
            await agent.Construction.updateStartEndDate(safeId, {
                constructionId: safeId,
                startDate: format(data.startDate, 'yyyy-MM-dd'),
                endDate: format(data.endDate, 'yyyy-MM-dd'),
            });
            toast.success("Dátumy boli upravené.");
            setTimeout(() => {
                setEditStartEndDateDialogOpen(false);
                window.location.href = window.location.href;
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
                updateConstructionNameDescriptionForm.reset({name: constructionData?.name, description: constructionData?.description ?? ''});
                updateStartEndDateForm.reset({startDate: new Date(constructionData?.startDate ?? todayDateString), endDate: new Date(constructionData?.endDate ?? todayDateString)});
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch construction data:", error);
                setLoading(false);
            }
        };
        fetchConstructionData();
    }, [id]);

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
                        <div className="flex items-center">
                            <Avatar className="w-24 h-24 mr-6">
                                <AvatarImage src={apiUrl + constructionData.profilePictureUrl} alt={constructionData.id} />
                                <AvatarFallback>{constructionData.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    {constructionData.name}
                                </CardTitle>
                                <p className="text-gray-700 mt-1">{constructionData.description}</p>
                            </div>
                        </div>
                        <Dialog open={editNameDescriptionDialogOpen} onOpenChange={setEditNameDescriptionDialogOpen}>
                            <DialogTrigger asChild className="mb-2">
                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50">
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
                                <DialogTrigger asChild className="mb-2">
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
                    </CardContent>
                </Card>
            </div>
            <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={true} closeOnClick pauseOnHover/>
        </div>
    );
}