// User authentication state management 
// frontend/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// Backend API URL (Aapki .env file se aana chahiye, par abhi hardcode kar rahe hain)
const API_URL = 'http://localhost:5000/api'; 

// 1. Context Create karo
const AuthContext = createContext();

// Custom hook to use AuthContext easily
export const useAuth = () => useContext(AuthContext);

// 2. Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores user data
    const [loading, setLoading] = useState(true); // Initial loading state
    const router = useRouter();

    // --- Helper: Set Auth Headers (Axios Interceptor) ---
    const setAuthHeaders = (token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token); // Token local storage mein save karo
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    };

    // --- 3. Initial Load: Check Token and Fetch Profile ---
    useEffect(() => {
        const loadUserFromStorage = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setAuthHeaders(token);
                try {
                    // Profile fetch karke token validate karo
                    const { data } = await axios.get(`${API_URL}/auth/profile`);
                    setUser(data);
                } catch (error) {
                    console.error('Token validation failed, logging out.', error);
                    setAuthHeaders(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUserFromStorage();
    }, []);

    // --- 4. Registration Function ---
    const register = async (userData) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/register`, userData);
            setAuthHeaders(data.token);
            setUser(data);
            router.push('/dashboard');
            toast.success('Registration successful! Welcome.');
            return data;
        } catch (error) {
            setLoading(false);
            const message = error.response?.data?.message || 'Registration failed.';
            toast.error(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // --- 5. Login Function ---
    const login = async (credentials) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, credentials);
            setAuthHeaders(data.token);
            setUser(data);
            router.push('/dashboard');
            toast.success('Login successful!');
            return data;
        } catch (error) {
            setLoading(false);
            const message = error.response?.data?.message || 'Login failed.';
            toast.error(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    // --- 6. Logout Function (Clears state and headers) ---
    const logout = () => {
        setAuthHeaders(null);
        setUser(null);
        toast('Logged out successfully!', { icon: '👋' });
        router.push('/login');
    };

    // --- 7. Context Value ---
    const contextValue = {
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        setUser, // For updating user balance/profile without re-fetching
        API_URL
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {/* Jab tak loading hai, tab tak kuch display nahi karo */}
            {loading ? <div className='text-center p-8'>Loading application...</div> : children} 
        </AuthContext.Provider>
    );
};