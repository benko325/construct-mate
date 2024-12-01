import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '@/features/TopBar.tsx';

const ProtectedRoute: React.FC = () => {
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