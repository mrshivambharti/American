// Protected route wrapper 
// frontend/components/PrivateRoute.js

import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Ek Higher-Order Component (HOC) jo component ko wrap karega
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Agar loading ho rahi hai, toh kuch nahi dikhao
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-500">
                Loading user session...
            </div>
        );
    }

    // Agar authenticated nahi hai aur URL /login ya /register nahi hai, toh redirect karo
    if (!isAuthenticated && router.pathname !== '/login' && router.pathname !== '/register') {
        // Next.js mein client-side navigation use karte hain
        router.replace('/login'); 
        return null; // Redirect hone tak kuch render nahi karo
    }

    // Agar authenticated hai, toh child component render karo
    return <>{children}</>;
};

export default PrivateRoute;