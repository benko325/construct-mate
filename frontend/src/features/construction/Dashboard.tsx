import { Button } from '../../components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';
import agent from '@/app/api/agent.ts';
import TopBar from '../TopBar.tsx';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Progress } from '@/components/ui/progress.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input.tsx';
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { AxiosError } from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL + "/" || 'http://localhost:5000/';

interface Construction {
    id: string;
    name: string;
    description: string;
    profilePictureUrl: string;
    startDate: string;
    endDate: string;
};
  
const fetchUnfinishedConstructions = async (): Promise<Construction[]> => {
    const result = await agent.Construction.getAllUnfinished();
    return result;
};

const fetchFinishedConstructions = async (): Promise<Construction[]> => {
    const result = await agent.Construction.getAllFinished();
    return result;
};

const newConstructionFormSchema = z.object({
    name: z.string().min(1, { message: 'Názov musí obsahovať aspoň 1 znak' }).max(64, { message: 'Názov musí obsahovať maximálne 64 znakov' }),
    description: z.string().max(512, { message: 'Opis môže mať maximálne 512 znakov' }),
    startDate: z.date(),
    endDate: z.date(),
});

type NewConstructionFormData = z.infer<typeof newConstructionFormSchema>;

export default function Dashboard() {
    const navigate = useNavigate();

    const { data: unfinishedConstructions, isLoading: unfinishedIsLoading, error: unfinishedError } = useQuery<Construction[]>({queryKey: ["unfinishedConstructions"], queryFn: fetchUnfinishedConstructions});
    const { data: finishedConstructions, isLoading: finishedIsLoading, error: finishedError } = useQuery<Construction[]>({queryKey: ["finishedConstructions"], queryFn: fetchFinishedConstructions});

    const newConstructionForm = useForm<NewConstructionFormData>({
        resolver: zodResolver(newConstructionFormSchema),
        defaultValues: {
            name: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    const [dialogOpen, setDialogOpen] = useState(false); 

    const onSubmit = async (data: NewConstructionFormData) => {
        try {
            await agent.Construction.createNew({
                name: data.name,
                description: data.description,
                startDate: format(data.startDate, 'yyyy-MM-dd'),
                endDate: format(data.endDate, 'yyyy-MM-dd')
            });
            toast.success("Stavba bola vytvorená.");
            setTimeout(() => {
                setDialogOpen(false);
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
                    newConstructionForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Register error:', error);
                    newConstructionForm.setError('root', {
                        type: 'manual',
                        message: `Dátum začiatku musí byť pred dátumom konca.`,
                    });
                } else {
                    console.error("Unknown register error:", error);
                    newConstructionForm.setError('root', {
                        type: 'manual',
                        message: 'An error occurred. Please try again.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown register error:", error);
                newConstructionForm.setError('root', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
        }
    };

    function calculateProgress(startDate: string, endDate: string): number {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const today = new Date();

        if (today < start) return 0; // Not started yet
        if (today > end) return 100; // Completed

        const totalDuration = end.getTime() - start.getTime();
        const elapsed = today.getTime() - start.getTime();

        return Math.min((elapsed / totalDuration) * 100, 100);
    }

    if (unfinishedIsLoading || finishedIsLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopBar />
                <p>Načítavam stavby...</p>
            </div>
        );
    };

    if (unfinishedError || finishedError) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopBar />
                <p>Chyba pri načítavaní stavieb.</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />

            <div className="p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold mb-2">Moje aktuálne stavby</h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild className="mb-2">
                            <Button variant="outline" className="bg-green-500 hover:bg-green-300">Vytvoriť novú stavbu</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Vytvorte novú stavbu</DialogTitle>
                                <DialogDescription>
                                    Vytvorte novú stavbu vyplnením potrebných údajov. <br />
                                    Kliknite "Vytvoriť" pre vytvorenie.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-2">
                                <Form {...newConstructionForm}>
                                    <form onSubmit={newConstructionForm.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={newConstructionForm.control}
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
                                            control={newConstructionForm.control}
                                            name="description"
                                            render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Opis (nepovinný)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Novostavba na Staromyjavskej ulici, ..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={newConstructionForm.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Začiatok</FormLabel>
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
                                            control={newConstructionForm.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Koniec</FormLabel>
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
                                        {newConstructionForm.formState.errors.root && (
                                        <div className="text-red-500 text-sm mt-2">
                                            {newConstructionForm.formState.errors.root.message}
                                        </div>
                                        )}
                                        <Button type="submit" className="w-full" disabled={newConstructionForm.formState.isSubmitting}>
                                            {newConstructionForm.formState.isSubmitting ? (
                                                <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Prosím počkajte...
                                                </>
                                            ) : (
                                                'Vytvoriť stavbu'
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                            <DialogFooter/>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unfinishedConstructions?.map((construction) => (
                    <Card key={construction.id} className="w-full">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    {/* Images and other static files are served in the <apiUrl>/data - configured in BE */}
                                    <AvatarImage src={apiUrl + construction.profilePictureUrl} alt={construction.id} />
                                    <AvatarFallback>SBA</AvatarFallback>
                                </Avatar>
                                <CardTitle>{construction.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{construction.description}</p>
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>{format(parseISO(construction.startDate), 'dd.MM.yyyy')}</span>
                                <span>{format(parseISO(construction.endDate), 'dd.MM.yyyy')}</span>
                            </div>
                            <Progress value={calculateProgress(construction.startDate, construction.endDate)} />
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </div>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Moje dokončené stavby</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {finishedConstructions?.map((construction) => (
                    <Card key={construction.id} className="w-full">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    {/* Images and other static files are served in the <apiUrl>/data - configured in BE */}
                                    <AvatarImage src={apiUrl + construction.profilePictureUrl} alt={construction.id} />
                                    <AvatarFallback>SBA</AvatarFallback>
                                </Avatar>
                                <CardTitle>{construction.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{construction.description}</p>
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>{format(parseISO(construction.startDate), 'dd.MM.yyyy')}</span>
                                <span>{format(parseISO(construction.endDate), 'dd.MM.yyyy')}</span>
                            </div>
                            <Progress value={calculateProgress(construction.startDate, construction.endDate)} />
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </div>
            <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={true} closeOnClick pauseOnHover/>
        </div>
    );
}