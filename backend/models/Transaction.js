// Transaction schema 
// backend/models/Transaction.js

const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    txId: { // Unique transaction ID (System-generated)
        type: String,
        required: true,
        unique: true,
        default: () => mongoose.Types.ObjectId().toHexString() // Simple unique ID generation
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // User Model se reference
    },
    type: {
        type: String,
        required: true,
        enum: ["deposit", "withdraw", "entry", "win", "loss"] // Fixed types
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },
    referenceId: { // Agar kisi round ya external system se related ho
        type: String,
        default: null
    },
    description: {
        type: String,
        default: ""
    }
}, {
    timestamps: true // createdAt and updatedAt
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;