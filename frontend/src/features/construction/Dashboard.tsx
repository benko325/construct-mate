import { Button } from '../../components/ui/button.tsx';
import { Link, useNavigate } from 'react-router-dom';
import agent from '@/app/api/agent.ts';
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
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
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
import { Textarea } from '@/components/ui/textarea.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import { ConstructionDiary } from '@/app/api/types/responseTypes.ts';
import { Book } from "lucide-react";

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

const fetchUnfinishedContributionDiaries = async (): Promise<ConstructionDiary[]> => {
    const result = await agent.ConstructionDiary.getUnfinishedDiariesWhereIAmContributor();
    return result;
};

const fetchFinishedContributionDiaries = async (): Promise<ConstructionDiary[]> => {
    const result = await agent.ConstructionDiary.getFinishedDiariesWhereIAmContributor();
    return result;
};

const newConstructionFormSchema = z.object({
    name: z.string().min(1, { message: 'Názov musí obsahovať aspoň 1 znak' }).max(64, { message: 'Názov musí obsahovať maximálne 64 znakov' }),
    description: z.string().max(512, { message: 'Opis môže mať maximálne 512 znakov' }),
    startDate: z.date(),
    endDate: z.date(),
}).refine((data) => data.startDate < data.endDate, {message: "Dátum začiatku musí byť skôr ako dátum konca"});

type NewConstructionFormData = z.infer<typeof newConstructionFormSchema>;

export default function Dashboard() {
    const { data: unfinishedConstructions, isLoading: unfinishedIsLoading, error: unfinishedError } = useQuery<Construction[]>({queryKey: ["unfinishedConstructions"], queryFn: fetchUnfinishedConstructions});
    const { data: finishedConstructions, isLoading: finishedIsLoading, error: finishedError } = useQuery<Construction[]>({queryKey: ["finishedConstructions"], queryFn: fetchFinishedConstructions});
    const { data: unfinishedContributionDiaries, isLoading: unfinishedContributionDiariesIsLoading, error: unfinishedContributionDiariesError } = useQuery<ConstructionDiary[]>({queryKey: ["unfinishedContributionDiaries"], queryFn: fetchUnfinishedContributionDiaries});
    const { data: finishedContributionDiaries, isLoading: finishedContributionDiariesIsLoading, error: finishedContributionDiariesError } = useQuery<ConstructionDiary[]>({queryKey: ["finishedContributionDiaries"], queryFn: fetchFinishedContributionDiaries});

    const navigate = useNavigate();
    const handleOpenDiaryButtonClick = (diary: ConstructionDiary) => {
        navigate(`/diary/${diary.id}`, { state: { constructionDiary: diary } });
    };

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
                // TODO: add construction to the object instead of reloading the page - when there is too much time for that
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
                    console.error('Create construction error from BE validations:', error);
                    newConstructionForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    // only ErrorMessage that can be sent by BE
                    console.error('Create construction error:', error);
                    newConstructionForm.setError('root', {
                        type: 'manual',
                        message: `Dátum začiatku musí byť pred dátumom konca.`,
                    });
                } else {
                    console.error("Unknown create construction error:", error);
                    newConstructionForm.setError('root', {
                        type: 'manual',
                        message: 'Nastala chyba. Skúste prosím znova.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown create construction error:", error);
                newConstructionForm.setError('root', {
                    type: 'manual',
                    message: 'Nastala chyba. Skúste prosím znova.',
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

    if (unfinishedIsLoading || finishedIsLoading || unfinishedContributionDiariesIsLoading || finishedContributionDiariesIsLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <p>Načítavam stavby a denníky...</p>
            </div>
        );
    };

    if (unfinishedError || finishedError || unfinishedContributionDiariesError || finishedContributionDiariesError) {
        return (
            <div className="min-h-screen bg-gray-100">
                <p>Chyba pri načítavaní stavieb a denníkov.</p>
            </div>
        );
    };

    return (
        <div>
            <div className="p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold mb-2">Moje aktuálne stavby</h2>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild className="mb-2">
                            <Button variant="outline" className="bg-green-300 hover:bg-green-100">Vytvoriť novú stavbu</Button>
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        {/* Images and other static files are served in the <apiUrl>/data - configured in BE */}
                                        <AvatarImage src={apiUrl + construction.profilePictureUrl} alt={construction.id} />
                                        <AvatarFallback>SBA</AvatarFallback>
                                    </Avatar>
                                    <CardTitle>{construction.name}</CardTitle>
                                </div>
                                <Link 
                                    to={`/construction/${construction.id}`}
                                    className="ml-auto text-sm"
                                >
                                    <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50">
                                        Otvoriť
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>{format(parseISO(construction.startDate), 'dd.MM.yyyy')}</span>
                                <span>{format(parseISO(construction.endDate), 'dd.MM.yyyy')}</span>
                            </div>
                            <Progress aria-label="construction-progress-bar" value={calculateProgress(construction.startDate, construction.endDate)} />
                        </CardContent>
                    </Card>
                    ))}
                </div>
            </div>
            <div className="p-6">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <h2 className="text-2xl font-semibold">Denníky, v ktorých som prispievateľ (aktuálne)</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {unfinishedContributionDiaries?.map((diary) => (
                                    <Card key={diary.id} className="w-full">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar>
                                                        <AvatarFallback><Book /></AvatarFallback>
                                                    </Avatar>
                                                    <CardTitle>{diary.name}</CardTitle>
                                                </div>
                                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50" onClick={() => handleOpenDiaryButtonClick(diary)}>
                                                    Otvoriť
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                <span>{format(parseISO(diary.diaryDateFrom), 'dd.MM.yyyy')}</span>
                                                <span>{format(parseISO(diary.diaryDateTo), 'dd.MM.yyyy')}</span>
                                            </div>
                                            <Progress value={calculateProgress(diary.diaryDateFrom, diary.diaryDateTo)} />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="p-6">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <h2 className="text-2xl font-semibold">Moje ukončené stavby</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {finishedConstructions?.map((construction) => (
                                <Card key={construction.id} className="w-full">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    {/* Images and other static files are served in the <apiUrl>/data - configured in BE */}
                                                    <AvatarImage src={apiUrl + construction.profilePictureUrl} alt={construction.id} />
                                                    <AvatarFallback>SBA</AvatarFallback>
                                                </Avatar>
                                                <CardTitle>{construction.name}</CardTitle>
                                            </div>
                                            <Link 
                                                to={`/construction/${construction.id}`}
                                                className="ml-auto text-sm"
                                            >
                                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50">
                                                    Otvoriť
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                            <span>{format(parseISO(construction.startDate), 'dd.MM.yyyy')}</span>
                                            <span>{format(parseISO(construction.endDate), 'dd.MM.yyyy')}</span>
                                        </div>
                                        <Progress value={calculateProgress(construction.startDate, construction.endDate)} />
                                    </CardContent>
                                </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="p-6">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <h2 className="text-2xl font-semibold">Denníky, v ktorých som bol prispievateľ (ukončené)</h2>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {finishedContributionDiaries?.map((diary) => (
                                    <Card key={diary.id} className="w-full">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar>
                                                        <AvatarFallback><Book /></AvatarFallback>
                                                    </Avatar>
                                                    <CardTitle>{diary.name}</CardTitle>
                                                </div>
                                                <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-50" onClick={() => handleOpenDiaryButtonClick(diary)}>
                                                    Otvoriť
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                <span>{format(parseISO(diary.diaryDateFrom), 'dd.MM.yyyy')}</span>
                                                <span>{format(parseISO(diary.diaryDateTo), 'dd.MM.yyyy')}</span>
                                            </div>
                                            <Progress value={calculateProgress(diary.diaryDateFrom, diary.diaryDateTo)} />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}