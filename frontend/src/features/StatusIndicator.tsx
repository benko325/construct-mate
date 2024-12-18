import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusIndicatorProps {
    fieldName: string;
    value: any;
    onOpenButtonClick: () => void;
    onCreateButtonClick: () => void;
    valuePresentText: string;
    valueNotPresentText: string;
    valuePresentButtonText: string;
    valueNotPresentButtonText: string;
    valuePresentModifyButtonText: string | null;
    onModifyValueButtonClick: () => void | null;
};

export default function StatusIndicator ({ fieldName, value, onOpenButtonClick, valuePresentText,
    valueNotPresentText, onCreateButtonClick, valuePresentButtonText, valueNotPresentButtonText, 
    valuePresentModifyButtonText, onModifyValueButtonClick } : StatusIndicatorProps) {
    return (
        <div className="flex items-center justify-between p-4 border rounded-md shadow-sm bg-white">
            <div className="text-gray-800 text-sm font-medium">{fieldName}</div>

            <div className="flex items-center space-x-2">
                {value ? (
                    <>
                        <CheckCircle className="text-green-500 h-5 w-5" />
                        <span className="text-sm text-green-600">{valuePresentText}</span>
                    </>
                ) : (
                    <>
                        <XCircle className="text-red-500 h-5 w-5" />
                        <span className="text-sm text-red-600">{valueNotPresentText}</span>
                    </>
                )}
            </div>

            {value ? (
                <div className="flex items-center space-x-2"> 
                    {valuePresentModifyButtonText && (
                        <Button
                            onClick={onModifyValueButtonClick}
                            variant="outline"
                            size="sm"
                            className="bg-blue-100 hover:bg-blue-50"
                        >
                            {valuePresentModifyButtonText}
                        </Button>
                    )}
                    <Button
                        onClick={onOpenButtonClick}
                        variant="outline"
                        size="sm"
                        className="ml-2" 
                    >
                        {valuePresentButtonText}
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={onCreateButtonClick}
                    variant="outline"
                    size="sm"
                    className="ml-4 bg-green-300 hover:bg-green-100"
                    type="submit"
                >
                    {valueNotPresentButtonText}
                </Button>
            )}
        </div>
    );
};
