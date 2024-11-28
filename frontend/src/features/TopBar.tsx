import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import agent from '@/app/api/agent';
import { useQuery } from '@tanstack/react-query';

interface UserInfo {
    id: string;
    name: string;
    email: string;
};

const fetchUserInfo = async (): Promise<UserInfo> => {
    const result = await agent.Account.currentUser();
    return result;
};

const TopBar: React.FC = () => {
    const { data, isLoading, error } = useQuery<UserInfo>({
        queryKey: ["userInfo"],
        queryFn: fetchUserInfo
    });

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

    if (isLoading) {
        return <p>Načítavam info o uživateľovi...</p>;
    }

    if (error) {
        return <p>Nastala chyba pri načítaní informácií o uživateľovi.</p>;
    }

    return (
        <div className="flex items-center justify-between bg-white shadow-md px-4 py-2">
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
                {isLoading ? (
                    <div>
                        <p><strong>Načítavam info...</strong></p>
                    </div>
                ) : error ? (
                    <p>Nastala chyba pri získavaní údajov.</p>
                ) : data ? (
                    <>
                        <p><strong>Prihlásený uživateľ:</strong> {data.name}</p>
                        <p><strong>Email:</strong> {data.email}</p>
                    </>
                ) : (
                    <p>Žiadne dostupné info.</p>
                )}
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
