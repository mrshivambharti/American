// Landing Page / Redirect to /dashboard 
// frontend/pages/index.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// --- Redirect Component ---
const HomePage = () => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                // Agar logged in hai, toh Dashboard par bhej do
                router.replace('/dashboard');
            } else {
                // Agar logged in nahi hai, toh Login page par bhej do
                router.replace('/login');
            }
        }
    }, [isAuthenticated, loading, router]);

    // Loading ya redirecting state mein ek simple placeholder dikhao
    return (
        <div className="flex justify-center items-center min-h-screen text-lg text-gray-500 dark:text-gray-400">
            {loading ? 'Initializing application...' : 'Redirecting...'}
        </div>
    );
};

export default HomePage; // Default export is a React Component