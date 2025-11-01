// Round/Game schema 
// backend/models/Round.js

const mongoose = require('mongoose');

// Participant Schema (Kon join hua aur uska unique code kya hai)
const participantSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    joinTime: {
        type: Date,
        default: Date.now
    },
    uniqueCode: { // User ka unique code for transparency (e.g., a hash or simple index)
        type: String,
        required: true
    },
    isWinner: {
        type: Boolean,
        default: false
    }
});

const roundSchema = mongoose.Schema({
    roundId: { // Custom Round ID for display (e.g., RND-20251101-0001)
        type: String,
        required: true,
        unique: true
    },
    gameType: {
        type: String,
        required: true,
        enum: ["₹50", "₹100", "₹200", "₹500", "₹1000"]
    },
    entryFee: {
        type: Number,
        required: true
    },
    // Game Parameters
    minPlayers: { type: Number, default: 5 },
    maxPlayers: { type: Number, default: 10 },
    entryWindowSeconds: { type: Number, default: 180 }, // 3 minutes

    participants: [participantSchema], // Array of users who joined
    
    // Financials
    totalPool: { // Total entries * entryFee
        type: Number,
        default: 0
    },
    platformFee: { // 10% of totalPool retained by platform
        type: Number,
        default: 0
    },
    winningsDistributed: { // 90% of totalPool distributed to winners
        type: Number,
        default: 0
    },

    startTime: { // Jab round shuru hua
        type: Date,
        default: Date.now
    },
    endTime: { // Jab entry window khatam hua
        type: Date,
        required: true
    },
    resultsProcessedAt: { // Jab winners selected aur payout hua
        type: Date,
        default: null
    },

    winners: [mongoose.Schema.Types.ObjectId], // Array of winning User IDs
    
    winningSeed: { // Cryptographically secure random number used for winner selection
        type: String,
        default: null
    },

    status: {
        type: String,
        required: true,
        enum: ["waiting", "running", "completed", "cancelled"],
        default: "waiting"
    }
}, {
    timestamps: true 
});

const Round = mongoose.model('Round', roundSchema);

module.exports = Round;