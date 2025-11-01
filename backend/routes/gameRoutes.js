// /api/game/* 
// backend/routes/gameRoutes.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware'); 
const { 
    getActiveRounds,
    handleJoinRound,
    getMyRounds
} = require('../controllers/gameController');

const router = express.Router();

// Saare game routes 'protect' middleware se secure hain
router.use(protect);

// GET /api/game/active - Sabhi active rounds ki list
router.get('/active', getActiveRounds);

// POST /api/game/join - Kisi round ko join karo
router.post('/join', handleJoinRound);

// GET /api/game/myrounds - User ki round history
router.get('/myrounds', getMyRounds);

module.exports = router;