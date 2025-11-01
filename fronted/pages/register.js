// /register 
// frontend/pages/register.js

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, isAuthenticated } = useAuth();
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

        // Simple client-side validation for phone number length
        if (phone.length !== 10) {
            alert('Phone number must be exactly 10 digits.');
            setLoading(false);
            return;
        }

        try {
            // AuthContext ke register function ko call karo
            await register({ name, email, phone, password });
            // Registration successful hone par automatic redirect ho jayega AuthContext mein
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
                <title>Register | American Locus</title>
            </Head>
            <div className="flex items-center justify-center min-h-full">
                <div className="w-full max-w-lg bg-white dark:bg-gray-700 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 transition duration-300">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
                        📝 Create Your Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Phone Input */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number (10 Digits)
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                maxLength="10"
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Enter 10 digit phone number"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Create a password"
                            />
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Register Account'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;