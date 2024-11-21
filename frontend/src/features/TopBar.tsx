import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import agent from '@/app/api/agent';

const TopBar: React.FC = () => {
    // const { setIsAuthenticated } = useAuth(); // TODO: uncomment when useAuth is correctly resolved
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await agent.Account.logout();
            // setIsAuthenticated(false); // TODO: uncomment when useAuth is correctly resolved
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="flex items-center justify-between bg-white shadow-md px-4 py-2">
            <h1 className="text-lg font-semibold cursor-pointer">
                <Link to="/dashboard">
                    Construct Mate
                </Link>
            </h1>
            <div className="flex space-x-4">
                <Link to="/profile">
                    <Button variant="outline">
                        Môj profil
                    </Button>
                </Link>
                <Button onClick={handleLogout} variant="link" color="red">
                    Odhlásiť sa
                </Button>
            </div>
        </div>
    );
};

export default TopBar;
