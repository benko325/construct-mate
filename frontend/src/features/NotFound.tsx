import { useNavigate } from "react-router-dom";
import TopBar from "./TopBar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const navigate = useNavigate();
    
    const goToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />
            <div className="flex flex-col items-center justify-start h-screen">
                <h1 className="text-2xl font-semibold m-2">Ups, stránka sa nenašla :(</h1>
                <Button onClick={goToDashboard} variant="outline">
                    Späť na úvod
                </Button>
            </div>
        </div>
    );
}