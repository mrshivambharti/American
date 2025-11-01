// /login 
// frontend/pages/login.js

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

const LoginPage = () => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    // Agar user pehle se logged in hai, toh dashboard par redirect karo
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // AuthContext ke login function ko call karo
            await login({ emailOrPhone, password });
            // Login successful hone par automatic redirect ho jayega AuthContext mein
        } catch (error) {
            // Error handling toast mein ho chuka hai
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return null; // Redirect hone tak kuch render nahi karo
    }

    return (
        <>
            <Head>
                <title>Login | American Locus</title>
            </Head>
            <div className="flex items-center justify-center min-h-full">
                <div className="w-full max-w-md bg-white dark:bg-gray-700 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 transition duration-300">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
                        🎯 Login to American Locus
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email or Phone Input */}
                        <div>
                            <label 
                                htmlFor="emailOrPhone" 
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email or Phone
                            </label>
                            <div className="mt-1">
                                <input
                                    id="emailOrPhone"
                                    name="emailOrPhone"
                                    type="text"
                                    required
                                    value={emailOrPhone}
                                    onChange={(e) => setEmailOrPhone(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter email or phone number"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 disabled:opacity-50"
                            >
                                {loading ? 'Logging In...' : 'Login'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-yellow-600 hover:text-yellow-500">
                                Register here
                            </Link>
                        </p>
                        {/* Forgot Password link (Future enhancement) */}
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700">
                            <Link href="#">Forgot Password?</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;