// /api/wallet/* 
// backend/routes/walletRoutes.js

const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware'); 
const { 
    getBalance, 
    depositFunds, 
    withdrawFunds, 
    getTransactionHistory 
} = require('../controllers/walletController');

const router = express.Router();

// Saare wallet routes 'protect' middleware se secure hain
router.use(protect);

// GET /api/wallet/balance - Current balance dekho
router.get('/balance', getBalance);

// GET /api/wallet/history - Transaction history dekho
router.get('/history', getTransactionHistory);

// POST /api/wallet/deposit - Funds deposit karo (Mock/Manual)
// NOTE: Ideally, deposit is done by an external payment gateway. 
// For manual testing/mock, we keep it simple for now. 
router.post('/deposit', depositFunds);

// POST /api/wallet/withdraw - Withdrawal request daalo (Pending approval)
router.post('/withdraw', withdrawFunds);


// --- Admin Wallet Routes (Optional but important for management) ---
// Note: Withdraw management is part of the Admin Panel, jo hum aage banayenge.

module.exports = router;