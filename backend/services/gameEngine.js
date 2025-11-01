// Core game loop and winning logic 
// backend/services/gameEngine.js

const crypto = require('crypto');
const Round = require('../models/Round');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// --- Game Configuration (as defined in Core Objective) ---
const GAME_CONFIGS = [
    { type: "₹50", entryFee: 50, minPlayers: 5, maxPlayers: 10, entryWindowSeconds: 120 }, // 2 minutes
    { type: "₹100", entryFee: 100, minPlayers: 5, maxPlayers: 10, entryWindowSeconds: 180 }, // 3 minutes
    { type: "₹200", entryFee: 200, minPlayers: 5, maxPlayers: 10, entryWindowSeconds: 180 }, 
    { type: "₹500", entryFee: 500, minPlayers: 5, maxPlayers: 10, entryWindowSeconds: 240 }, // 4 minutes
    { type: "₹1000", entryFee: 1000, minPlayers: 5, maxPlayers: 10, entryWindowSeconds: 300 }, // 5 minutes
];

const PLATFORM_FEE_PERCENT = 0.10; // 10%
const WINNER_PERCENT = 0.50; // 50% of participants win

let ioInstance = null; // Socket.io instance store karne ke liye

// Socket.io instance ko initialize karo
const initSocket = (io) => {
    ioInstance = io;
    console.log('✅ Game Engine initialized with Socket.io');
};

// --- Helper: Generate Unique Round ID ---
const generateRoundId = (gameType) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 random chars
    return `RND-${gameType.replace('₹', '')}-${dateStr}-${randomHex}`;
};

// --- 1. Round Payout and Winner Selection Logic ---
const processRound = async (round) => {
    console.log(`Processing Round: ${round.roundId}`);
    
    // Check karo ki minimum players hain ya nahi
    if (round.participants.length < round.minPlayers) {
        // Agar players kam hain toh round cancel
        round.status = 'cancelled';
        round.description = `Cancelled: Only ${round.participants.length}/${round.minPlayers} players joined.`;
        await round.save();
        console.log(`❌ Round Cancelled: ${round.roundId}`);

        // Refunds process karo
        await Promise.all(round.participants.map(async (p) => {
            await User.findByIdAndUpdate(p.userId, { $inc: { balance: round.entryFee } });
            await Transaction.create({
                userId: p.userId,
                type: 'loss', // Technically a refund, using 'loss' type for entry reversal with positive amount
                amount: round.entryFee,
                status: 'success',
                referenceId: round.roundId,
                description: `Refund: Round cancelled due to low participation (${round.roundId})`
            });
        }));
        // Socket broadcast (Optional: Can add a cancelled event)
        return; 
    }

    // --- Financial Calculations ---
    const totalPool = round.participants.length * round.entryFee;
    const platformFee = Math.floor(totalPool * PLATFORM_FEE_PERCENT);
    const winningsPool = totalPool - platformFee; // 90%
    
    const numWinners = Math.ceil(round.participants.length * WINNER_PERCENT); // 50% winners
    const winningAmountPerUser = Math.floor(winningsPool / numWinners); // Equal distribution among winners
    const remainingPoolAfterPayout = winningsPool - (winningAmountPerUser * numWinners);
    
    // --- Winner Selection (Fair Play) ---
    // Cryptographically secure seed generate karo
    const winningSeed = crypto.randomBytes(32).toString('hex');
    const participantsList = round.participants;
    
    // Seed use karke winners select karo
    const winners = [];
    const participantsCopy = [...participantsList]; // Copy for random selection without affecting original
    
    // Simple random selection (using Fisher-Yates shuffle approximation for fairness)
    const shuffledParticipants = participantsCopy
        .map(value => ({ value, sort: Math.random() })) // Add a random sort key
        .sort((a, b) => a.sort - b.sort) // Sort by the random key
        .map(({ value }) => value);
        
    for (let i = 0; i < numWinners && i < shuffledParticipants.length; i++) {
        winners.push(shuffledParticipants[i].userId);
    }

    // --- Payout Processing ---
    await Promise.all(winners.map(async (winnerId) => {
        // 1. User balance update karo
        await User.findByIdAndUpdate(winnerId, { $inc: { balance: winningAmountPerUser } });
        
        // 2. Transaction record create karo
        await Transaction.create({
            userId: winnerId,
            type: 'win',
            amount: winningAmountPerUser,
            status: 'success',
            referenceId: round.roundId,
            description: `Winnings from Round ${round.roundId}`
        });
        
        // 3. Participant status update karo
        const participantIndex = round.participants.findIndex(p => p.userId.equals(winnerId));
        if (participantIndex !== -1) {
            round.participants[participantIndex].isWinner = true;
        }
    }));
    
    // --- Update Round Status ---
    round.totalPool = totalPool;
    round.platformFee = platformFee;
    round.winningsDistributed = winningAmountPerUser * numWinners;
    round.winners = winners;
    round.winningSeed = winningSeed;
    round.status = 'completed';
    round.resultsProcessedAt = new Date();
    
    await round.save();
    console.log(`✅ Round Completed: ${round.roundId}. Winners: ${numWinners}. Platform Fee: ${platformFee}`);

    // Non-winning participants ke liye 'loss' transaction record karo (Entry deduction already done)
    const nonWinners = round.participants.filter(p => !winners.some(w => w.equals(p.userId)));
    await Promise.all(nonWinners.map(async (p) => {
        await Transaction.create({
            userId: p.userId,
            type: 'loss',
            amount: round.entryFee, // Record the entry amount as a loss
            status: 'success',
            referenceId: round.roundId,
            description: `Entry lost in Round ${round.roundId}`
        });
    }));

    // Socket broadcast for final result
    if (ioInstance) {
        ioInstance.to(round.roundId).emit('roundResult', {
            roundId: round.roundId,
            status: 'completed',
            winners: winners,
            winningSeed: winningSeed,
            payout: winningAmountPerUser
        });
        ioInstance.emit('globalUpdate', { roundId: round.roundId, type: 'completed' });
    }
};

// --- 2. Continuous Game Engine Loop ---
const startEngine = () => {
    console.log('--- 🎮 Game Engine Started ---');
    
    // Har game type ke liye loop chalao
    GAME_CONFIGS.forEach(config => {
        
        // SetInterval use karo taaki har game type continuously run ho sake
        setInterval(async () => {
            try {
                // 1. Check karo ki koi 'running' round end time cross kar chuka hai ya nahi
                const expiredRound = await Round.findOne({ 
                    gameType: config.type,
                    status: 'running',
                    endTime: { $lte: new Date() } // End time beet chuka hai
                });

                if (expiredRound) {
                    await processRound(expiredRound);
                }
                
                // 2. Check karo ki koi 'waiting' ya 'running' round exist karta hai ya nahi
                const activeRound = await Round.findOne({ 
                    gameType: config.type, 
                    status: { $in: ['waiting', 'running'] } 
                });

                // Agar koi active round nahi hai, toh naya round create karo
                if (!activeRound) {
                    const entryWindowSeconds = config.entryWindowSeconds;
                    const startTime = new Date();
                    const endTime = new Date(startTime.getTime() + entryWindowSeconds * 1000);
                    
                    const newRound = await Round.create({
                        roundId: generateRoundId(config.type),
                        gameType: config.type,
                        entryFee: config.entryFee,
                        minPlayers: config.minPlayers,
                        entryWindowSeconds: entryWindowSeconds,
                        startTime: startTime,
                        endTime: endTime,
                        status: 'running' // Directly running state mein daal rahe hain
                    });

                    console.log(`✨ New Round Started: ${newRound.roundId} (${config.type}) - Ends at ${endTime.toLocaleTimeString()}`);
                    
                    // Global Socket broadcast for new round
                    if (ioInstance) {
                        ioInstance.emit('newRound', {
                            roundId: newRound.roundId,
                            gameType: newRound.gameType,
                            entryFee: newRound.entryFee,
                            endTime: newRound.endTime
                        });
                    }
                }
                
                // 3. Live Round Status Update (Har 5 seconds mein)
                const currentRound = await Round.findOne({ 
                    gameType: config.type, 
                    status: 'running' 
                });
                
                if (currentRound && ioInstance) {
                     // Timer calculation
                    const remainingTime = Math.max(0, currentRound.endTime.getTime() - new Date().getTime());
                    
                    ioInstance.emit(`round:${currentRound.gameType}:update`, {
                        roundId: currentRound.roundId,
                        participantsCount: currentRound.participants.length,
                        remainingTimeMs: remainingTime,
                        status: 'running'
                    });
                }


            } catch (error) {
                console.error(`🔴 Game Engine Error for ${config.type}:`, error.message);
            }
        }, 5000); // Har 5 seconds mein check karo (Fast frequency for real-time feel)
    });
};

// --- 3. User Joins Round Logic (Will be called from gameController) ---
const joinRound = async (userId, gameType) => {
    const config = GAME_CONFIGS.find(c => c.type === gameType);
    if (!config) throw new Error('Invalid game type.');

    // 1. Active Round find karo
    const activeRound = await Round.findOne({ 
        gameType: gameType, 
        status: 'running' 
    });

    if (!activeRound) throw new Error('No active round available to join.');
    
    // 2. Check karo ki user pehle se joined toh nahi hai
    const alreadyJoined = activeRound.participants.some(p => p.userId.equals(userId));
    if (alreadyJoined) throw new Error('You have already joined this round.');
    
    // 3. User ko lock karo aur balance check karo
    const user = await User.findById(userId);
    if (user.balance < config.entryFee) throw new Error('Insufficient wallet balance to join.');

    // --- Transaction: Balance Deduction ---
    // Note: Atomicity is crucial here. Using Mongoose transaction or fine-grained update is best.
    // Simple deduction:
    user.balance -= config.entryFee;
    await user.save();
    
    // Transaction record
    await Transaction.create({
        userId,
        type: 'entry',
        amount: config.entryFee,
        status: 'success',
        referenceId: activeRound.roundId,
        description: `Entry fee for Round ${activeRound.roundId}`
    });

    // 4. Participant add karo
    const uniqueCode = activeRound.participants.length + 1; // Simple index as unique code
    activeRound.participants.push({ userId, uniqueCode: uniqueCode.toString() });
    await activeRound.save();

    // 5. Socket broadcast for new participant
    if (ioInstance) {
        ioInstance.emit(`round:${gameType}:update`, {
            roundId: activeRound.roundId,
            participantsCount: activeRound.participants.length,
        });
    }

    return {
        roundId: activeRound.roundId,
        uniqueCode: uniqueCode.toString(),
        newBalance: user.balance
    };
};

module.exports = { 
    initSocket, 
    startEngine, 
    joinRound, 
    processRound,
    GAME_CONFIGS // Frontend ke liye zaroori
};