// Individual game box (₹50, ₹100, etc.) 
// frontend/components/GameCard.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// Agar aap Next.js 13+ App Router use kar rahe hain, toh yeh use hota: 
// import { useRouter } from 'next/navigation'; 
// Lekin aap Pages Router use kar rahe hain, so: next/router sahi hai.
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const GameCard = ({ config, lobbyData, userBalance }) => {
    const { login, setUser, API_URL } = useAuth();
    const [isJoining, setIsJoining] = useState(false);
    const [timeLeft, setTimeLeft] = useState(lobbyData.currentRound?.remainingTimeMs || 0);
    const router = useRouter(); // To redirect to specific game page

    // --- Timer Logic (Har second update hoga) ---
    useEffect(() => {
        if (lobbyData.isActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => Math.max(0, prevTime - 1000));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [lobbyData.isActive, timeLeft]);
    
    // Server se aaye time ko sync karo
    useEffect(() => {
        setTimeLeft(lobbyData.currentRound?.remainingTimeMs || 0);
    }, [lobbyData.currentRound?.remainingTimeMs]);

    const formatTime = (ms) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // --- Join Round Handler ---
    const handleJoin = async () => {
        if (userBalance < config.entryFee) {
            toast.error("Insufficient balance. Please deposit funds first.");
            return;
        }

        setIsJoining(true);
        try {
            const { data } = await axios.post(`${API_URL}/game/join`, {
                gameType: config.type // e.g., "₹50"
            });

            toast.success(`Joined Round ${data.roundId}! Your code: ${data.uniqueCode}`);
            
            // Context mein user balance update karo
            setUser(prevUser => ({
                ...prevUser,
                balance: data.newBalance
            }));
            
            // Redirect to the specific game details page
            router.push(`/game/${config.entryFee}`); 
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join round.');
        } finally {
            setIsJoining(false);
        }
    };
    
    // --- Card Display State ---
    const isRoundActive = lobbyData.isActive && lobbyData.currentRound && timeLeft > 0;
    const participantsCount = lobbyData.currentRound?.participantsCount || 0;
    const maxPlayers = lobbyData.currentRound?.maxPlayers || config.maxPlayers || 10;
    
    return (
        <div className={`
            p-6 rounded-xl shadow-2xl transition duration-300 transform hover:scale-[1.02] 
            ${isRoundActive ? 'bg-green-600/20 border-2 border-green-500' : 'bg-gray-700/50 border border-gray-600'}
        `}>
            <div className="flex justify-between items-center">
                <h3 className={`text-4xl font-extrabold ${isRoundActive ? 'text-green-400' : 'text-yellow-400'}`}>
                    {config.type}
                </h3>
                <span className="text-lg font-semibold text-white bg-gray-800 px-3 py-1 rounded-full">
                    Entry: **₹{config.entryFee}**
                </span>
            </div>

            <p className="text-gray-300 mt-2 text-sm h-10">{config.description}</p>
            
            <div className="mt-4 space-y-3">
                {isRoundActive ? (
                    <>
                        <div className="text-center bg-gray-900 p-2 rounded-lg border border-yellow-500/50">
                            <p className="text-xs text-yellow-300">Round Ends In:</p>
                            <p className="text-3xl font-bold text-yellow-400 mt-1">{formatTime(timeLeft)}</p>
                        </div>

                        <div className="flex justify-between items-center text-sm font-medium text-gray-200">
                            <span>Players:</span>
                            <span className="text-green-300">{participantsCount}/{maxPlayers}</span>
                        </div>
                        
                        <button
                            onClick={handleJoin}
                            disabled={isJoining || participantsCount >= maxPlayers}
                            className="w-full py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-md hover:bg-yellow-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isJoining 
                                ? 'Joining...' 
                                : participantsCount >= maxPlayers 
                                    ? 'Round Full'
                                    : 'JOIN ROUND NOW'}
                        </button>
                    </>
                ) : (
                    <div className="h-24 flex items-center justify-center bg-gray-900/50 rounded-lg border-dashed border border-gray-500">
                        <p className="text-sm text-gray-400 animate-pulse">
                            **Waiting for Next Round...**
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameCard;