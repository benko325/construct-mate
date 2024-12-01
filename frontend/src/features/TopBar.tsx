import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import agent from '@/app/api/agent';
import { useUser } from '@/context/UserContext';

const TopBar: React.FC = () => {
    const { user, logout } = useUser();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await agent.Account.logout();
            logout(); // remove user from UserContext
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            navigate('/login');
        }
    };

    if (!user) {
        return <p>Načítavam info o uživateľovi...</p>;
    }

    return (
        <div className="flex items-center justify-between shadow-md px-4 py-2">
            <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold">
                    Construct Mate
                </h1>
                <Link to="/dashboard">
                    <Button variant="outline">
                        Domov
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <p><strong>Prihlásený uživateľ:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
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
