import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '@/features/TopBar.tsx';

const ProtectedRoute: React.FC = () => {
    return (
        <div className="">
            <TopBar />
            <div className="main-content min-h-screen bg-gray-100">
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedRoute;