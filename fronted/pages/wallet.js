// /wallet 
// frontend/pages/wallet.js

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PrivateRoute from '../components/PrivateRoute';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Sub-Component: Transaction History Table ---
const TransactionHistory = ({ history }) => {
    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
                Transaction History (Last 50)
            </h3>
            
            <div className="overflow-x-auto bg-white dark:bg-gray-700 rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (₹)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                                    No transactions recorded yet.
                                </td>
                            </tr>
                        ) : (
                            history.map((tx) => (
                                <tr key={tx.txId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                        tx.type === 'win' || tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {tx.type.toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {tx.type === 'entry' || tx.type === 'withdraw' ? '-' : ''}₹{tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            tx.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                                            'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                                        }`}>
                                            {tx.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(tx.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {tx.description}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const WalletPage = () => {
    const { user, setUser, API_URL } = useAuth();
    const [history, setHistory] = useState([]);
    const [tab, setTab] = useState('deposit'); // 'deposit' or 'withdraw'
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    // --- 1. Fetch Transaction History ---
    const fetchHistory = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/wallet/history`);
            setHistory(data);
        } catch (error) {
            toast.error('Failed to load transaction history.');
        }
    };

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    // --- 2. Deposit Handler (Mock) ---
    const handleDeposit = async (e) => {
        e.preventDefault();
        if (amount <= 0) return toast.error("Amount must be greater than zero.");

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/wallet/deposit`, { amount });

            // Update user balance in AuthContext
            setUser(prevUser => ({ ...prevUser, balance: data.balance }));
            fetchHistory(); // History refresh karo
            setAmount(0);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Deposit failed.');
        } finally {
            setLoading(false);
        }
    };

    // --- 3. Withdraw Handler (Mock/Pending) ---
    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (amount <= 0) return toast.error("Amount must be greater than zero.");
        if (amount > user?.balance) return toast.error("Insufficient balance for withdrawal.");
        
        // UPI ID check (Profile mein set hona chahiye)
        if (!user.upiId) {
             toast.error("Please update your UPI/Bank details in the Profile section before withdrawing.");
             return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/wallet/withdraw`, { amount });

            // Update user balance in AuthContext
            setUser(prevUser => ({ ...prevUser, balance: data.balance }));
            fetchHistory(); // History refresh karo
            setAmount(0);
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PrivateRoute>
            <Head>
                <title>Wallet | American Locus</title>
            </Head>
            
            <div className="space-y-8">
                {/* Current Balance Card */}
                <div className="bg-yellow-500 p-8 rounded-xl shadow-2xl flex justify-between items-center">
                    <div>
                        <p className="text-xl font-semibold text-gray-900">Current Wallet Balance</p>
                        <h2 className="text-6xl font-extrabold text-gray-900 mt-2">
                            ₹{user?.balance?.toFixed(2) || '0.00'}
                        </h2>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-800 opacity-30" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 111-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Deposit / Withdraw Tabs */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                    <div className="flex border-b border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => setTab('deposit')}
                            className={`py-2 px-4 text-lg font-medium transition duration-150 ${
                                tab === 'deposit' ? 'border-b-4 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            Mock Deposit (Credit)
                        </button>
                        <button
                            onClick={() => setTab('withdraw')}
                            className={`py-2 px-4 text-lg font-medium transition duration-150 ${
                                tab === 'withdraw' ? 'border-b-4 border-red-500 text-red-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            Mock Withdraw (Debit)
                        </button>
                    </div>

                    <div className="mt-6">
                        {/* Form */}
                        <form onSubmit={tab === 'deposit' ? handleDeposit : handleWithdraw} className="space-y-4">
                             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                 {tab === 'deposit' ? 'Add Funds to Wallet (Manual/Testing)' : 'Request Withdrawal (Pending Admin Approval)'}
                             </h3>

                             {tab === 'withdraw' && !user.upiId && (
                                <p className="text-red-500 text-sm">
                                    ⚠️ **Warning:** Please set your UPI/Bank details in the Profile tab before requesting a withdrawal.
                                </p>
                             )}

                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Amount (₹)
                                </label>
                                <input
                                    id="amount"
                                    type="number"
                                    min="10"
                                    step="any"
                                    required
                                    value={amount || ''}
                                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || amount <= 0}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 disabled:opacity-50 ${
                                    tab === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {loading 
                                    ? (tab === 'deposit' ? 'Processing Deposit...' : 'Processing Withdrawal...') 
                                    : (tab === 'deposit' ? 'Process Deposit (Mock)' : 'Request Withdrawal (Pending)')
                                }
                            </button>
                        </form>
                    </div>
                </div>
                
                {/* Transaction History */}
                <TransactionHistory history={history} />

            </div>
        </PrivateRoute>
    );
};

export default WalletPage;