import React, { useState } from "react";
import { FormItem } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UUID } from "crypto";
import { toast } from "react-toastify";
import { UploadedFile } from "@/app/api/types/responseTypes";

type FileUploadComponentProps = {
    uploadFunction: (id: UUID, data: FormData) => Promise<any>;
    id: UUID;
    setDialogOpen?: (open: boolean) => void; // Optional prop to control dialog state
    responseFieldValue?: string; // value of field in response object that contains updated value 
    updateField?: (value: string) => void; // function that updates a field in the showed object, so the new file is showed (responseFieldValue can not be null then)
    addUploadedFileToList?: (file: UploadedFile) => void; // Function to add the new file to the list of an object (if present, responseFieldValue and updateField must be null)
    // responseFieldValue, updateField and addUploadedFileToList are used to update the object, from which is the page rendered
    // if addUploadedFileToList is not null, then updateField and responseFieldValue are null and the function is used to add a new file to list of files
    // if updateField and responseFieldValue are not null, then addUploadedFileToList must be null and responseFiledValue is name of the field in response, where a new value (file path) is returned
    // ... and updateField function updates the respective field with new value
    fileFormats: string; // formats that are accepted by file upload component
};

const FileUploadForm = ({ uploadFunction, id, setDialogOpen, updateField, responseFieldValue, fileFormats, addUploadedFileToList}: FileUploadComponentProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const MAX_FILE_SIZE_MB = 50; // Set the maximum file size in MB

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            const fileSizeInMB = selectedFile.size / (1024 * 1024);
            if (fileSizeInMB > MAX_FILE_SIZE_MB) {
                setError(`Súbor je príliš veľký. Maximálna povolená veľkosť je ${MAX_FILE_SIZE_MB}MB.`);
                setFile(null);
                return;
            }

            setFile(selectedFile);
        }
    };

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
            if (responseFieldValue && updateField) {
                updateField(result[responseFieldValue]);
            }
            if (addUploadedFileToList) {
                const newUploadedFileObject: UploadedFile = {
                    id: result.id,
                    filePath: result.filePath,
                    fileSize: result.fileSize,
                    createdAt: result.createdAt,
                    name: result.name,
                };
    
                addUploadedFileToList(newUploadedFileObject);
            }
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
