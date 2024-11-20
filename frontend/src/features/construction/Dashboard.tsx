import React from 'react';
import { Button } from '../../components/ui/button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import agent from '@/app/api/agent.ts';
import TopBar from '../TopBar.tsx';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Progress } from '@/components/ui/progress.tsx';

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

export default function Dashboard() {
    const navigate = useNavigate();

    const { data: unfinishedConstructions, isLoading: unfinishedIsLoading, error: unfinishederror } = useQuery<Construction[]>({queryKey: ["unfinishedConstructions"], queryFn: fetchUnfinishedConstructions});
    const { data: finishedConstructions, isLoading: finishedIsLoading, error: finishederror } = useQuery<Construction[]>({queryKey: ["finishedConstructions"], queryFn: fetchFinishedConstructions});

    const calculateProgress = (startDate: string, endDate: string): number => {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const today = new Date();
    
        if (today < start) return 0; // Not started yet
        if (today > end) return 100; // Completed
    
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = today.getTime() - start.getTime();
    
        return Math.min((elapsed / totalDuration) * 100, 100);
    };

    if (unfinishedIsLoading || finishedIsLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <TopBar />
                <p>Načítavam stavby...</p>
            </div>
        );
    };

    if (unfinishederror || finishederror) {
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
                <h2 className="text-2xl font-semibold mb-6">Moje aktuálne stavby</h2>
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
        </div>
    );
}