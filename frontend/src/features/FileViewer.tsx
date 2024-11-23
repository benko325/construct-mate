import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FileViewerProps = {
    fileUrl: string;
    fileType: "image" | "pdf";
    fileName: string;
    open: boolean;
    onClose: () => void;
};

// TODO: upravit aby obrazky ukazovalo mensie a bez scrollbarov

export default function FileViewer({ fileUrl, fileType, fileName, open, onClose }: FileViewerProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="w-full max-w-4xl max-h-[90vh] h-auto p-4 rounded-md overflow-hidden">
                <DialogHeader className="flex justify-between items-center">
                    <DialogTitle>{fileName}</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-center w-full h-full mt-4 overflow-hidden">
                    {fileType === "image" ? (
                        <img 
                            src={fileUrl} 
                            alt={fileName}
                            className="max-w-full max-h-full object-contain"
                            style={{ maxHeight: "80vh", width: "auto" }} // Ensure the image scales without exceeding the viewport
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