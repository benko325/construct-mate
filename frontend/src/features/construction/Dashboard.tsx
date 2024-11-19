import React from 'react';
import { Button } from '../../components/ui/button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import agent from '@/app/api/agent.ts';

export default function Dashboard() {
    const { setIsAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await agent.Account.logout();
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const goToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-white shadow-md px-4 py-2">
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <div className="flex space-x-4">
                    <Button onClick={goToProfile} variant="outline">
                        My Profile
                    </Button>
                    <Button onClick={handleLogout} variant="link" color="red">
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Rest of dashboard content goes here */}
                <p>Welcome to your dashboard!</p>
            </div>
        </div>
    );
}