// Game logic, join round, results 
// backend/controllers/gameController.js

const asyncHandler = require('express-async-handler');
const Round = require('../models/Round');
const { joinRound, GAME_CONFIGS } = require('../services/gameEngine'); // Game Engine import kiya

// --- 1. Get All Active Games/Lobbies (/api/game/active) ---
const getActiveRounds = asyncHandler(async (req, res) => {
    // Current 'running' rounds ko game type ke hisaab se group karke dekhenge
    const activeRounds = await Round.find({ 
        status: { $in: ['running', 'waiting'] } // Currently running/waiting rounds
    })
    .sort({ entryFee: 1, startTime: -1 }) // Sort by entry fee and then by latest
    .populate('participants.userId', 'name'); // Participants ka sirf name fetch karo
    
    // Front-end ke liye data structure ko clean karo
    const response = GAME_CONFIGS.map(config => {
        const round = activeRounds.find(r => r.gameType === config.type);
        
        return {
            gameType: config.type,
            entryFee: config.entryFee,
            isActive: !!round, // Boolean check
            currentRound: round ? {
                roundId: round.roundId,
                participantsCount: round.participants.length,
                maxPlayers: round.maxPlayers,
                endTime: round.endTime,
                participantsPreview: round.participants.slice(0, 5).map(p => p.userId.name), // First 5 names
                status: round.status
            } : null
        };
    });

    res.json(response);
});

// --- 2. Join a Specific Round (/api/game/join) ---
const handleJoinRound = asyncHandler(async (req, res) => {
    const { gameType } = req.body; // e.g., "₹50", "₹100"
    const userId = req.user._id; // Auth Middleware se

    if (!gameType) {
        res.status(400);
        throw new Error('Please specify a game type to join.');
    }

    // Game Engine service se join logic call karo
    const result = await joinRound(userId, gameType);

    res.status(200).json({
        message: `Successfully joined Round ${result.roundId} (${gameType}).`,
        uniqueCode: result.uniqueCode,
        newBalance: result.newBalance,
        roundId: result.roundId
    });
});

// --- 3. Get User's Round History (/api/game/myrounds) ---
const getMyRounds = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Those rounds in which the user participated (limit to 50 latest)
    const myRounds = await Round.find({
        'participants.userId': userId,
        status: 'completed' // Sirf completed rounds dikhao
    })
    .sort({ resultsProcessedAt: -1 })
    .limit(50)
    .select('roundId gameType entryFee totalPool winners participants resultsProcessedAt');
    
    // Check karo ki user winner tha ya nahi aur uske hisaab se data format karo
    const formattedRounds = myRounds.map(round => {
        const isWinner = round.winners.some(winnerId => winnerId.equals(userId));
        const participant = round.participants.find(p => p.userId.equals(userId));
        
        let winningAmount = 0;
        if (isWinner) {
            // Recalculate the winning amount for display (based on 90% pool / 50% winners)
            const totalWinners = round.winners.length;
            const winningsPool = round.totalPool - round.platformFee;
            winningAmount = Math.floor(winningsPool / totalWinners);
        }
        
        return {
            roundId: round.roundId,
            gameType: round.gameType,
            entryFee: round.entryFee,
            result: isWinner ? 'WIN' : 'LOSS',
            payout: isWinner ? winningAmount : 0,
            participantsCount: round.participants.length,
            yourCode: participant ? participant.uniqueCode : 'N/A',
            processedAt: round.resultsProcessedAt
        };
    });

    res.json(formattedRounds);
});


module.exports = { 
    getActiveRounds,
    handleJoinRound,
    getMyRounds
};