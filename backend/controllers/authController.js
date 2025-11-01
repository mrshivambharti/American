// User registration, login, profile 
// backend/controllers/authController.js

const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // For simple error handling
const jwt = require('jsonwebtoken');

// Helper function to generate JWT (hum isko config folder mein shift karenge baad mein)
// Payload mein sirf userId aur deviceToken dalenge
const generateToken = (userId, deviceToken) => {
    // JWT expiry: 1 hour (as per project requirements)
    return jwt.sign({ userId, deviceToken }, process.env.JWT_SECRET, {
        expiresIn: '1h', 
    });
};

// --- 1. User Registration (/api/auth/register) ---
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;

    // Validation checks
    if (!name || !email || !phone || !password) {
        res.status(400);
        throw new Error('Please fill all fields: name, email, phone, and password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email or phone number.');
    }

    // Create a new device token (a random unique string for single-device login check)
    const deviceToken = require('crypto').randomBytes(16).toString('hex');
    
    // Create new user (passwordHash field mein password pass kar rahe hain, Mongoose pre-save hook usko hash kar dega)
    const user = await User.create({
        name,
        email,
        phone,
        passwordHash: password, 
        deviceToken, // Save the unique device token
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            balance: user.balance,
            // JWT token generate karke client ko bhejenge
            token: generateToken(user._id, deviceToken),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data received.');
    }
});

// --- 2. User Login (/api/auth/login) ---
const loginUser = asyncHandler(async (req, res) => {
    const { emailOrPhone, password } = req.body;

    // Check if user exists by email or phone
    const user = await User.findOne({ 
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] 
    });

    // Match password
    if (user && (await user.matchPassword(password))) {
        
        // Generate a new device token for the new session
        const newDeviceToken = require('crypto').randomBytes(16).toString('hex');
        
        // Update user's device token in DB (This invalidates all previous sessions - single-device login)
        user.deviceToken = newDeviceToken;
        await user.save(); // Save the updated deviceToken
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            balance: user.balance,
            // JWT token with the new device token
            token: generateToken(user._id, newDeviceToken),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials (Email/Phone or Password).');
    }
});

// --- 3. Get User Profile (/api/auth/profile) ---
// Note: Is route ko authMiddleware se protect kiya jayega
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user authMiddleware se aayega
    const user = await User.findById(req.user._id).select('-passwordHash -deviceToken');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            balance: user.balance,
            upiId: user.upiId,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// --- 4. Update User Profile (/api/auth/profile) ---
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.upiId = req.body.upiId || user.upiId; // UPI/Bank update

        // Agar password change karna ho
        if (req.body.password) {
            user.passwordHash = req.body.password; // Mongoose pre-save hook ise hash kar dega
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            upiId: updatedUser.upiId,
            balance: updatedUser.balance,
            message: 'Profile updated successfully!'
        });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };