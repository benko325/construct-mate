import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DailyRecord, DiaryContributorRole, DiaryRecord } from "../../app/api/types/responseTypes.ts";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const getRoleName = (role: DiaryContributorRole): string => {
    switch (role) {
        case DiaryContributorRole.None:
            return "Žiadna pozícia";
        case DiaryContributorRole.ConstructionManager:
            return "Stavbyvedúci";
        case DiaryContributorRole.GovernmentalConstructionSupervisor:
            return "Štátny stavebný dozor";
        case DiaryContributorRole.Cartographer:
            return "Geodet a kartograf";
        case DiaryContributorRole.ConstructionOwner:
            return "Stavebník alebo vlastník stavby";
        case DiaryContributorRole.Designer:
            return "Projektant";
        case DiaryContributorRole.ConstructionSupplier:
            return "Zhotoviteľ stavby";
        case DiaryContributorRole.ConstructionControl:
            return "Stavebný dozor";
        case DiaryContributorRole.GovernmentalControl:
            return "Štátny dozor";
        case DiaryContributorRole.ConstructionWorkSafetyCoordinator:
            return "Koordinátor bezpečnosti práce";
        default:
            return "Neznáma pozícia";
    }
};

export default function ConstructionDiaryPage() {
    const location = useLocation();
    const diary = location.state?.constructionDiary;

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [filteredRecord, setFilteredRecord] = useState<DailyRecord | null>(null);

    if (!diary) {
        return <p className="text-center text-red-500">Denník nie je dostupný.</p>;
    }

    useEffect(() => {
        if (selectedDate) {
            const record = diary.dailyRecords.find((r: DailyRecord) => r.date === selectedDate) || null;
            setFilteredRecord(record);
        } else {
            setFilteredRecord(null);
        }
    }, [selectedDate, diary]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
                    <Label htmlFor="date-selector" className="pb-2">Vyberte dátum so záznamami:</Label>
                    <Select onValueChange={setSelectedDate}>
                        <SelectTrigger id="date-selector" className="w-full">
                            <SelectValue placeholder="Vyberte dátum" />
                        </SelectTrigger>
                        <SelectContent>
                            {diary.dailyRecords.map((record: DailyRecord) => (
                                <SelectItem key={record.date} value={record.date}>
                                    {record.date}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {filteredRecord ? (
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Denník zo dňa: {filteredRecord.date}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Počasie</h3>
                                        {filteredRecord.weather.map((item, index) => (
                                            <div key={index} className="p-4 border rounded mb-4">
                                                <div className="mb-2 pb-2 border-b border-gray-300">
                                                    <p><strong>Obsah:</strong> {item.content}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p>
                                                        <strong>Autor:</strong> {item.authorName}
                                                        {" "}
                                                        <span className="italic text-gray-500">
                                                            ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                        </span>
                                                    </p>
                                                    <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Pracovníci</h3>
                                        {filteredRecord.workers.map((item, index) => (
                                            <div key={index} className="p-4 border rounded mb-4">
                                                <div className="mb-2 pb-2 border-b border-gray-300">
                                                    <p><strong>Obsah:</strong> {item.content}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p>
                                                        <strong>Autor:</strong> {item.authorName}
                                                        {" "}
                                                        <span className="italic text-gray-500">
                                                            ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                        </span>
                                                    </p>
                                                    <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Stroje</h3>
                                        {filteredRecord.machines.map((item, index) => (
                                            <div key={index} className="p-4 border rounded mb-4">
                                                <div className="mb-2 pb-2 border-b border-gray-300">
                                                    <p><strong>Obsah:</strong> {item.content}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p>
                                                        <strong>Autor:</strong> {item.authorName}
                                                        {" "}
                                                        <span className="italic text-gray-500">
                                                            ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                        </span>
                                                    </p>
                                                    <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Práca</h3>
                                        {filteredRecord.work.map((item, index) => (
                                            <div key={index} className="p-4 border rounded mb-4">
                                                <div className="mb-2 pb-2 border-b border-gray-300">
                                                    <p><strong>Obsah:</strong> {item.content}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p>
                                                        <strong>Autor:</strong> {item.authorName}
                                                        {" "}
                                                        <span className="italic text-gray-500">
                                                            ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                        </span>
                                                    </p>
                                                    <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <h3 className="text-xl font-semibold my-2 text-indigo-800">Ostatné</h3>
                                        {filteredRecord.otherRecords.map((item, index) => (
                                            <div key={index} className="p-4 border rounded mb-4">
                                                <div className="mb-2 pb-2 border-b border-gray-300">
                                                    <p><strong>Obsah:</strong> {item.content}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p>
                                                        <strong>Autor:</strong> {item.authorName}
                                                        {" "}
                                                        <span className="italic text-gray-500">
                                                            ({getRoleName(item.authorRole as DiaryContributorRole)})
                                                        </span>
                                                    </p>
                                                    <p><strong>Vytvorený:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-gray-500">Zvoľte dátum pre zobrazenie záznamov.</p>
                )}
            </div>
        </div>
    );
}