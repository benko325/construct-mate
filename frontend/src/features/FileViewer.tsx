import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FileViewerProps = {
    fileUrl: string;
    fileType: "image" | "pdf";
    fileName: string;
    open: boolean;
    onClose: () => void;
};

export default function FileViewer({ fileUrl, fileType, fileName, open, onClose }: FileViewerProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] h-auto p-4 rounded-md overflow-hidden">
                <DialogHeader className="flex justify-between items-center">
                    <DialogTitle>{fileName}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                    <Button asChild variant="outline" size="sm" className="w-auto p-1">
                        <a href={fileUrl} download>
                            Zobraziť v plnej veľkosti
                        </a>
                    </Button>
                </div>
                <div className="flex justify-center items-center w-full h-full overflow-hidden">
                    {fileType === "image" ? (
                        <img 
                            src={fileUrl} 
                            alt={fileName}
                            className="max-w-full max-h-full object-contain"
                            style={{ maxHeight: "80vh", width: "auto" }}
                        />
                    ) : (
                        <iframe 
                            src={fileUrl} 
                            title={fileName} 
                            className="w-full h-[70vh] rounded-md"
                            style={{ border: "none" }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}