import App from "@/App";
import ProfilePage from "../../features/profile/ProfilePage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/features/user/Login";
import Register from "@/features/user/Register";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            // {path: '', element: <HomePage />},
            {path: 'profile', element: <ProfilePage />},
            {path: 'login', element: <Login />},
            {path: 'register', element: <Register />},
            {path: '*', element: <Navigate replace to='/not-found' />},
        ]
    }
])