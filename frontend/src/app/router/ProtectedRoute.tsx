import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '@/features/NavBar';

const ProtectedRoute: React.FC = () => {
    return (
        <div className="bg-gray-100 h-screen overflow-auto">
            <div className="h-full w-full flex flex-col">
                <NavBar />
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedRoute;