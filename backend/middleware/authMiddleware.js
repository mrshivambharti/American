// JWT verification, single-device check 
// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// --- 1. User Protection Middleware (JWT Verification & Single-Device Check) ---
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check karo ki header mein 'Authorization' aur 'Bearer' scheme hai ya nahi
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token ko extract karo (Bearer <token> se sirf <token> lenge)
            token = req.headers.authorization.split(' ')[1];

            // Token ko verify karo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // JWT Payload mein se userId aur deviceToken mil jayega
            const { userId, deviceToken: tokenDeviceToken } = decoded;

            // Database se user ko fetch karo (passwordHash field exclude karke)
            const user = await User.findById(userId).select('-passwordHash');

            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            
            // --- Single-Device Login Check ---
            // Current token ka deviceToken, database mein stored deviceToken se match hona chahiye
            if (user.deviceToken !== tokenDeviceToken || !user.deviceToken) {
                // Agar match nahi hua toh iska matlab yeh session invalid ho chuka hai (new login ho chuka hai)
                res.status(401);
                throw new Error('Not authorized, session expired or logged in elsewhere.');
            }

            // User object ko request mein attach karo
            req.user = user;
            
            // Agar sab theek hai, toh next middleware/controller function pe jao
            next();

        } catch (error) {
            console.error(error);
            // JWT verification fail ya expiry par 401 Unauthorized return karo
            res.status(401);
            throw new Error('Not authorized, token failed or expired (1 hour limit)');
        }
    }

    // Agar token hi nahi mila
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});


// --- 2. Admin Protection Middleware ---
const admin = (req, res, next) => {
    // protect middleware ke baad req.user mein user object hoga
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as an Admin');
    }
};

module.exports = { protect, admin };