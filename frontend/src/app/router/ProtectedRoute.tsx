import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import TopBar from '@/features/TopBar.tsx';

interface ProtectedRouteProps {
    redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = '/login' }) => {
    // const { isAuthenticated } = useAuth();

    // if (!isAuthenticated) {
    //     return <Navigate to={redirectTo} replace />;
    // }
    // TODO: uncomment when resolved

    return (
        <div>
            <TopBar />
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedRoute;