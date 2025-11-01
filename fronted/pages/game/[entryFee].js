// Dynamic game page (e.g., /game/50) 
// frontend/pages/game/[entryFee].js

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PrivateRoute from '../../components/PrivateRoute';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000'; 

// Temporary configuration map (backend/services/gameEngine.js se match hona chahiye)
const ENTRY_MAP = {
    '50': "₹50", 
    '100': "₹100", 
    '200': "₹200", 
    '500': "₹500", 
    '1000': "₹1000",
};

// --- Helper: Format Time ---
const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


const GameDetailPage = () => {
    const router = useRouter();
    // URL parameter: [entryFee]
    const { entryFee } = router.query; 
    
    const { user, isAuthenticated, API_URL } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [roundData, setRoundData] = useState(null); // Current round details
    const [myParticipation, setMyParticipation] = useState(null); // User ka specific status/code
    const [timeLeft, setTimeLeft] = useState(0);
    const [socket, setSocket] = useState(null);

    // Dynamic game type (e.g., "₹100")
    const gameType = ENTRY_MAP[entryFee]; 

    // --- 1. Fetch Round Details and User Status ---
    const fetchRoundDetails = async () => {
        if (!gameType || !user) return;
        
        try {
            // Hum active rounds API se data fetch kar rahe hain
            const { data } = await axios.get(`${API_URL}/game/active`);
            const lobby = data.find(l => l.gameType === gameType);
            
            if (lobby && lobby.isActive) {
                const currentRound = lobby.currentRound;
                setRoundData(currentRound);
                setTimeLeft(currentRound.remainingTimeMs || 0);

                // Check karo ki user is round mein joined hai ya nahi
                const participant = currentRound.participantsPreview 
                    ? currentRound.participantsPreview.find(p => p.name === user.name) 
                    : null;
                
                // Note: Backend se participant ki uniqueCode nikalne ke liye ek dedicated API ya better data structure chahiye.
                // Abhi ke liye, hum sirf check kar rahe hain ki woh joined hai ya nahi.
                // Ideal scenario mein hum /api/game/:roundId/status se user ka uniqueCode fetch karenge.
                
                // For demonstration, manually setting a mock code if participant is found
                if (participant) {
                    setMyParticipation({
                        uniqueCode: 'MOCK-P-CODE', // Backend se aana chahiye
                        isWinner: currentRound.status === 'completed' 
                            ? currentRound.winners.some(w => w.name === user.name) // Mock check
                            : false,
                    });
                } else {
                    // Agar user joined nahi hai, toh dashboard par redirect karo (agar round running ho)
                    // router.replace('/dashboard'); 
                    // toast.error(`You are not an active participant in the ${gameType} round.`);
                }
            } else {
                setRoundData(null); // Round active nahi hai
            }
        } catch (error) {
            toast.error('Failed to load round details.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    // --- 2. Socket.io Setup for Live Updates ---
    useEffect(() => {
        if (!isAuthenticated || !gameType) return;
        
        fetchRoundDetails(); // Initial fetch

        const newSocket = io(SERVER_URL, {
            auth: { token: localStorage.getItem('token') } 
        });
        
        setSocket(newSocket);

        // --- Socket Listener: Live Round Update ---
        newSocket.on(`round:${gameType}:update`, (data) => {
            // Timer aur Participants count update karo
            setRoundData(prevData => ({
                ...prevData,
                participantsCount: data.participantsCount,
            }));
            setTimeLeft(data.remainingTimeMs);
        });
        
        // --- Socket Listener: Round Result (Completion) ---
        newSocket.on('globalUpdate', (data) => {
             // Agar yahi round complete hua hai
             if (data.type === 'completed' && roundData?.roundId === data.roundId) {
                 toast.success(`🎉 Round ${data.roundId} completed!`);
                 // Full data refresh karo
                 fetchRoundDetails();
             }
        });


        return () => {
            newSocket.disconnect();
        };

    }, [isAuthenticated, API_URL, gameType, user]); 


    // --- Timer Interval ---
    useEffect(() => {
        if (roundData && roundData.status === 'running' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => Math.max(0, prevTime - 1000));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [roundData, timeLeft]);


    if (loading || !user) {
        return <PrivateRoute><div className='p-10 text-center text-gray-500'>Loading Game Data...</div></PrivateRoute>;
    }
    
    // --- Render Logic ---
    const isRoundRunning = roundData && roundData.status === 'running' && timeLeft > 0;
    const isRoundCompleted = roundData && roundData.status === 'completed';
    const hasJoined = myParticipation; // Humne mock check kiya hai

    
    return (
        <PrivateRoute>
            <Head>
                <title>{gameType} Live Round | American Locus</title>
            </Head>
            
            <div className="space-y-6">
                <header className="bg-gray-900 text-white p-6 rounded-xl shadow-lg border-b-4 border-yellow-500">
                    <h1 className="text-3xl font-extrabold flex justify-between items-center">
                        <span>LIVE GAME: **{gameType}** Round</span>
                        <span className="text-sm font-light text-gray-400">{roundData?.roundId || 'N/A'}</span>
                    </h1>
                    <p className="text-lg font-medium text-yellow-400 mt-1">
                        Entry Fee: **{gameType}**
                    </p>
                </header>
                
                {/* --- Main Game Status Panel --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Panel 1: Timer / Result */}
                    <div className="md:col-span-2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                            {isRoundRunning ? 'Time Remaining for Entry' : isRoundCompleted ? 'Round Result & Payout' : 'Waiting for Next Round'}
                        </h3>
                        
                        {isRoundRunning && (
                            <div className="text-center py-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <p className="text-7xl font-extrabold text-red-600 dark:text-red-400 tabular-nums">
                                    {formatTime(timeLeft)}
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {roundData.participantsCount}/{roundData.maxPlayers} Players Joined
                                </p>
                            </div>
                        )}
                        
                        {isRoundCompleted && roundData.winners && (
                            <div className="mt-4 p-4 border border-green-500 bg-green-50 dark:bg-green-900 rounded-lg">
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                    🏆 Winners Announced!
                                </p>
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200 break-all">
                                    **Winning Seed (Proof of Fairness):** <span className='font-mono text-xs'>{roundData.winningSeed || 'N/A'}</span>
                                </p>
                                <p className="mt-2 text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Total Winners: **{roundData.winners.length}**
                                </p>
                            </div>
                        )}

                        {!isRoundRunning && !isRoundCompleted && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p className="text-lg animate-pulse">Game Engine is preparing the next round...</p>
                            </div>
                        )}
                    </div>

                    {/* Panel 2: My Status */}
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border-r-4 border-yellow-500">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Your Status
                        </h3>
                        
                        {hasJoined ? (
                            <div className="space-y-3">
                                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md">
                                    <p className="text-xs text-gray-600 dark:text-gray-300">Your Unique Code:</p>
                                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
                                        {myParticipation.uniqueCode}
                                    </p>
                                </div>
                                
                                <p className="text-md font-medium">
                                    Round Status: **{isRoundCompleted ? 'Completed' : 'Running'}**
                                </p>
                                
                                {isRoundCompleted && (
                                    <div className={`p-3 rounded-md ${myParticipation.isWinner ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        <p className="font-bold text-lg">
                                            {myParticipation.isWinner ? `You WON! Payout Credited.` : `You LOST. Better luck next time.`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                                <p className="mb-3">You have not joined the current **{gameType}** round.</p>
                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-600"
                                >
                                    Go to Dashboard to Join
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Participants List --- */}
                {roundData?.participantsPreview && roundData.participantsPreview.length > 0 && (
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                            Current Participants ({roundData.participantsCount}/{roundData.maxPlayers})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {roundData.participantsPreview.map((name, index) => (
                                <span 
                                    key={index} 
                                    className={`px-3 py-1 text-sm rounded-full ${name === user.name ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                                >
                                    {name}
                                </span>
                            ))}
                            {roundData.participantsCount > roundData.participantsPreview.length && (
                                <span className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                    +{roundData.participantsCount - roundData.participantsPreview.length} others
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PrivateRoute>
    );
};

export default GameDetailPage;