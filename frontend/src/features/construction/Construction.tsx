import { useParams } from "react-router-dom";
import TopBar from "../TopBar";

export default function Construction() {
    // id of a construction from the url
    const {id} = useParams<{id: string}>();
    
    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />

        </div>
    );
}