import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { UUID } from 'crypto';
import agent from '@/app/api/agent';
import { useLocation, useNavigate } from 'react-router-dom';

interface UserInfo {
    id: UUID;
    name: string;
    email: string;
};

interface UserContextValue {
    user: UserInfo | null;
    fetchUser: () => Promise<void>;
    logout: () => void;
};

interface UserProviderProps {
    children: ReactNode;
};

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: UserProviderProps) => {
    const location = useLocation(); 
    const navigate = useNavigate();
    const [user, setUser] = useState<UserInfo | null>(null);

    const fetchUser = async () => {
        try {
            const response = await agent.Account.currentUser();
            setUser(response);
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            setUser(null);
            // do not navigate to login when register page is opened
            if (location.pathname !== '/register') {
                navigate('/login');
            }
        }
    };

    const logout = () => {
        setUser(null);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return <UserContext.Provider value={{ user, fetchUser, logout }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextValue => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};