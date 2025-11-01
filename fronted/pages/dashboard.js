// /dashboard 
// frontend/pages/dashboard.js

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import PrivateRoute from '../components/PrivateRoute';
import GameCard from '../components/GameCard'; // Next step mein banayenge
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

// Server URL (AuthContext se aayega, par yahan bhi define kar rahe hain for Socket.io)
const SERVER_URL = 'http://localhost:5000'; 

const DashboardPage = () => {
    const { user, API_URL, isAuthenticated } = useAuth();
    const [activeLobbies, setActiveLobbies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // --- 1. Fetch Initial Active Rounds Data ---
    const fetchActiveRounds = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/game/active`);
            setActiveLobbies(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch active games.');
            setActiveLobbies([]);
        } finally {
            setLoading(false);
        }
    };
    
    // --- 2. Socket.io Setup for Live Updates ---
    useEffect(() => {
        if (!isAuthenticated) return;

        fetchActiveRounds();

        const newSocket = io(SERVER_URL, {
            // JWT Token ko authentication ke liye pass karo
            auth: { token: localStorage.getItem('token') } 
        });
        
        setSocket(newSocket);

        // --- Socket Listeners ---
        
        // Listen for new round creations (Game Engine se)
        newSocket.on('newRound', (data) => {
            console.log("New round started: ", data.roundId);
            // Naye rounds ke liye list update karo
            fetchActiveRounds(); 
        });

        // Listen for round updates (participants count, timer)
        newSocket.on('globalUpdate', (data) => {
            // Agar round complete hua hai, toh list refresh karo
            if (data.type === 'completed') {
                 console.log(`Round completed: ${data.roundId}`);
                 fetchActiveRounds();
            }
        });
        
        // Listen for specific game type updates (like ₹50:update)
        GAME_CONFIGS.forEach(config => {
            newSocket.on(`round:${config.type}:update`, (data) => {
                // Lobby state update karo
                setActiveLobbies(prevLobbies => prevLobbies.map(lobby => {
                    if (lobby.gameType === config.type && lobby.isActive) {
                        return {
                            ...lobby,
                            currentRound: {
                                ...lobby.currentRound,
                                participantsCount: data.participantsCount,
                                remainingTimeMs: data.remainingTimeMs,
                            }
                        };
                    }
                    return lobby;
                }));
            });
        });

        return () => {
            // Component unmount hone par socket disconnect karo
            newSocket.disconnect();
        };

    // Note: Dependencies list mein fetchActiveRounds ko daalna zaroori hai agar woh context se na ho
    }, [isAuthenticated, API_URL]); 

    // Frontend mein use karne ke liye Game Configs (Temporary hardcode, ideally API se aana chahiye)
    const GAME_CONFIGS = [
        { type: "₹50", entryFee: 50, description: "Quickest draw, lowest entry." },
        { type: "₹100", entryFee: 100, description: "Standard action, fast results." },
        { type: "₹200", entryFee: 200, description: "Mid-level excitement." },
        { type: "₹500", entryFee: 500, description: "High stakes, bigger pool." },
        { type: "₹1000", entryFee: 1000, description: "Mega stakes, max payout." },
    ];


    return (
        <PrivateRoute>
            <Head>
                <title>Dashboard | American Locus</title>
            </Head>
            
            <div className="space-y-8">
                <header className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, **{user?.name || 'Player'}**!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Choose a lobby and participate in the next lucky draw round.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl animate-pulse"></div>
                        ))
                    ) : activeLobbies.length > 0 ? (
                        activeLobbies.map((lobby, index) => {
                            const config = GAME_CONFIGS.find(c => c.type === lobby.gameType);
                            
                            return (
                                <GameCard 
                                    key={index}
                                    config={config} 
                                    lobbyData={lobby} 
                                    userBalance={user?.balance}
                                    socket={socket}
                                />
                            );
                        })
                    ) : (
                         <p className="text-center text-gray-500 col-span-5 p-10">No active lobbies found. Please check backend setup.</p>
                    )}
                </div>
            </div>
        </PrivateRoute>
    );
};

export default DashboardPage;