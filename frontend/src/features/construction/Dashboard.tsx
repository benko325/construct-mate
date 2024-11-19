import React from 'react';
import { Button } from '../../components/ui/button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import agent from '@/app/api/agent.ts';
import TopBar from '../TopBar.tsx';

export default function Dashboard() {
    const { setIsAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />

            {/* Main Content */}
            <div className="p-4">
                {/* Rest of dashboard content goes here */}
                <p>Welcome to your dashboard!</p>
            </div>
        </div>
    );
}