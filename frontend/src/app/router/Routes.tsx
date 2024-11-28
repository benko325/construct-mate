import App from "@/App";
import ProfilePage from "../../features/profile/ProfilePage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/features/user/Login";
import Register from "@/features/user/Register";
import Dashboard from "@/features/construction/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "@/features/NotFound";
import ConstructionData from "@/features/construction/Construction";
import ConstructionDiaryPage from "@/features/construction/ConstructionDiaryPage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },

            // { path: '', element: <Navigate replace to='/dashboard' /> },
            // { path: 'dashboard', element: <Dashboard /> },
            // { path: 'profile', element: <ProfilePage /> },
            // { path: 'construction/:id', element: <ConstructionData /> },

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '', element: <Navigate replace to='/dashboard' /> },
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'profile', element: <ProfilePage /> },
                    { path: 'construction/:id', element: <ConstructionData /> },
                    { path: 'construction/:constructionId/diary/:diaryId', element: <ConstructionDiaryPage /> },
                    { path: 'diary/:id', element: <ConstructionDiaryPage /> }
                ],
            },

            { path: '*', element: <Navigate replace to='/not-found' /> },
            { path: 'not-found', element: <NotFound/> },
        ]
    }
])