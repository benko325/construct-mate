import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
    className?: string;
}

export default function BackButton({ className }: BackButtonProps) {
    const navigate = useNavigate();
    
    const handleBackClick = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className={className + " bg-gray-300 rounded hover:bg-gray-100"}
            onClick={handleBackClick}
        >
            <ArrowLeft className="w-4 h-4" />
            Naspäť
        </Button>
    );
}