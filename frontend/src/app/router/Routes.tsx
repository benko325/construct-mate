import App from "@/App";
import ProfilePage from "../../features/profile/ProfilePage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/features/user/Login";
import Register from "@/features/user/Register";
import Dashboard from "@/features/construction/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '', element: <Navigate replace to='/dashboard' /> },
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'profile', element: <ProfilePage /> },
                ],
            },

            { path: '*', element: <Navigate replace to='/not-found' /> },
        ]
    }
])