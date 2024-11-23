import React, { useState } from "react";
import { FormItem } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UUID } from "crypto";
import { toast } from "react-toastify";

type FileUploadComponentProps = {
    uploadFunction: (id: UUID, data: FormData) => Promise<any>;
    id: UUID;
    setDialogOpen?: (open: boolean) => void; // Optional prop to control dialog state
    responseFieldValue: string; // value of field in response object that contains updated value 
    updateField: (value: string) => void;
    fileFormats: string; // formats that are accepted by file upload component
};

const FileUploadForm = ({ uploadFunction, id, setDialogOpen, updateField, responseFieldValue, fileFormats }: FileUploadComponentProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("Prosím zvoľte súbor.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setError(null);

        try {
            const result = await uploadFunction(id, formData);
            toast.success("Súbor bol úspešne nahratý.");
            updateField(result[responseFieldValue]);
            setTimeout(() => {
                if (setDialogOpen) setDialogOpen(false);
            }, 2500);
        } catch (error) {
            toast.error("Súbor sa nepodarilo nahrať.");
            console.error("Error uploading file:", error);
            setError("Failed to upload file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <form onSubmit={handleSubmit}>
                <FormItem>
                    <Label htmlFor="file">Vyberte súbor</Label>
                    <Input
                        type="file"
                        id="file"
                        name="file"
                        onChange={handleFileChange}
                        accept={fileFormats}
                    />
                </FormItem>

                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

                <Button
                    type="submit"
                    className="mt-4"
                    disabled={loading}
                >
                    {loading ? "Nahrávam..." : "Nahrať súbor"}
                </Button>
            </form>
        </div>
    );
};

export default FileUploadForm;
