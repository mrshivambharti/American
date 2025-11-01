// /api/auth/* 
// backend/routes/authRoutes.js

const express = require('express');
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // authMiddleware import kiya

const router = express.Router();

// Public Routes (No authentication needed)
// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);


// Protected Routes (Authentication needed: JWT check)

// GET /api/auth/profile -> Profile dekho
// PUT /api/auth/profile -> Profile update karo
// 'protect' middleware JWT verify karega aur user data req.user mein daal dega
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);


module.exports = router;