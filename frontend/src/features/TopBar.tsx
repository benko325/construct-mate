import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import agent from '@/app/api/agent';

const TopBar: React.FC = () => {
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

    const goToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-between bg-white shadow-md px-4 py-2">
            <h1 onClick={goToDashboard} className="text-lg font-semibold cursor-pointer">
                Construct Mate
            </h1>
            <div className="flex space-x-4">
                <Button onClick={goToProfile} variant="outline">
                    Môj profil
                </Button>
                <Button onClick={handleLogout} variant="link" color="red">
                    Odhlásiť sa
                </Button>
            </div>
        </div>
    );
};

export default TopBar;
