// /profile 
// frontend/pages/profile.js

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PrivateRoute from '../components/PrivateRoute';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, setUser, API_URL } = useAuth();
    
    // State to hold form data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [upiId, setUpiId] = useState('');
    const [currentPassword, setCurrentPassword] = useState(''); // Optional: For security/future use
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Initial load par user data set karo
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            // user object mein upiId nahi hai toh usko fetch karo
            // For now, hum assume kar rahe hain ki profile fetch mein yeh field bhi aati hai
            setUpiId(user.upiId || ''); 
        }
    }, [user]);

    // --- Profile Update Handler ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updateData = {
            name,
            email,
            upiId: upiId || '',
        };
        
        // Agar password field bhara hai, toh usko bhi bhejo
        if (newPassword) {
            // Note: Current password validation backend mein implement karna behtar hai
            // Hum yahan sirf naya password bhej rahe hain
            updateData.password = newPassword; 
        }

        try {
            const { data } = await axios.put(`${API_URL}/auth/profile`, updateData);

            // AuthContext mein user data update karo
            setUser(prevUser => ({
                ...prevUser,
                name: data.name,
                email: data.email,
                upiId: data.upiId,
            }));

            // Password fields clear karo update ke baad
            setCurrentPassword('');
            setNewPassword('');

            toast.success(data.message || 'Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PrivateRoute>
            <Head>
                <title>Profile | American Locus</title>
            </Head>

            <div className="space-y-8">
                <header className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Account Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Update your personal details and withdrawal information.
                    </p>
                </header>

                <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <h3 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                            Personal Details
                        </h3>

                        {/* Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        
                        {/* Phone Display (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number (Read-only)
                            </label>
                            <p className="mt-1 block w-full px-3 py-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md sm:text-sm">
                                {user?.phone}
                            </p>
                        </div>


                        <h3 className="text-xl font-semibold border-b pb-2 pt-4 mb-4 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                            Withdrawal Details
                        </h3>

                        {/* UPI ID Input */}
                        <div>
                            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                UPI ID (for Withdrawals)
                            </label>
                            <input
                                id="upiId"
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="e.g., username@bankname"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                This is required to process your withdrawal requests.
                            </p>
                        </div>
                        
                        
                        <h3 className="text-xl font-semibold border-b pb-2 pt-4 mb-4 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                            Change Password
                        </h3>

                        {/* New Password Input */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                New Password (Leave blank to keep current)
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Enter new password"
                            />
                        </div>


                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 disabled:opacity-50"
                            >
                                {loading ? 'Updating Profile...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PrivateRoute>
    );
};

export default ProfilePage;