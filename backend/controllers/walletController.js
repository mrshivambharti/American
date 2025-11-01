// Deposit, withdraw, history 
// backend/controllers/walletController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// --- 1. Get Wallet Balance (/api/wallet/balance) ---
const getBalance = asyncHandler(async (req, res) => {
    // req.user object authMiddleware se aata hai
    const user = await User.findById(req.user._id).select('balance');

    if (user) {
        res.json({
            balance: user.balance,
            message: 'Current wallet balance retrieved successfully.'
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});


// --- 2. Manual/Mock Deposit (Admin Feature in testing, but accessible for now) ---
// (/api/wallet/deposit)
const depositFunds = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const userId = req.user._id;

    if (isNaN(amount) || amount <= 0) {
        res.status(400);
        throw new Error('Invalid deposit amount.');
    }

    // 1. User balance update karo (Use $inc for atomic update)
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { new: true, runValidators: true }
    ).select('balance');

    if (!updatedUser) {
        res.status(404);
        throw new Error('User not found during deposit.');
    }
    
    // 2. Transaction record create karo
    await Transaction.create({
        userId: userId,
        type: 'deposit',
        amount: amount,
        status: 'success', // Mock deposit is instant success
        description: `Manual/Mock Deposit of ₹${amount}`
    });

    res.status(200).json({
        balance: updatedUser.balance,
        message: `Successfully deposited ₹${amount}. New balance: ₹${updatedUser.balance}`
    });
});


// --- 3. Manual/Mock Withdrawal Request (/api/wallet/withdraw) ---
const withdrawFunds = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const userId = req.user._id;

    if (isNaN(amount) || amount <= 0) {
        res.status(400);
        throw new Error('Invalid withdrawal amount.');
    }
    
    // User ko lock karke latest data fetch karo
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    // Balance check
    if (user.balance < amount) {
        res.status(400);
        throw new Error(`Insufficient balance. Current: ₹${user.balance}`);
    }

    // 1. Balance deduct karo (Real withdrawal pending state mein chalta hai)
    user.balance -= amount;
    await user.save(); // Simple update, we'll ensure atomicity via proper Game Engine later

    // 2. Transaction record create karo in 'pending' status
    const newTx = await Transaction.create({
        userId: userId,
        type: 'withdraw',
        amount: amount,
        status: 'pending', // Withdrawal needs Admin approval/manual processing
        description: `Withdrawal request for ₹${amount} to UPI: ${user.upiId || 'N/A'}`
    });

    res.status(202).json({
        balance: user.balance,
        txId: newTx.txId,
        message: `Withdrawal request of ₹${amount} initiated. Status: Pending Admin review. Current balance: ₹${user.balance}`
    });
});


// --- 4. Get Transaction History (/api/wallet/history) ---
const getTransactionHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    // Latest transactions pehle aayenge
    const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 }) // Sort by latest first
        .limit(50); // Limit to 50 transactions

    res.json(transactions);
});


module.exports = { 
    getBalance, 
    depositFunds, 
    withdrawFunds, 
    getTransactionHistory 
};