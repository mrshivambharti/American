// backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    // userId: Mongoose automatically adds _id as the primary key.
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Email unique hona chahiye
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: { // Isse hum original passwordHash save karenge
        type: String,
        required: true
    },
    balance: { // Default balance 0 se shuru hoga
        type: Number,
        required: true,
        default: 0
    },
    upiId: { // Bank/UPI details for withdrawal
        type: String,
        default: ""
    },
    deviceToken: { // Single-device login ke liye
        type: String,
        default: null
    },
    isAdmin: { // Admin access ke liye
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // createdAt aur updatedAt fields automatically add ho jayenge
});


// --- Password Hashing (Pre-Save Middleware) ---
userSchema.pre('save', async function (next) {
    // Check karo ki password modify hua hai ya nahi (sirf registration ya password change pe hash karna hai)
    if (!this.isModified('passwordHash')) {
        return next();
    }

    // Salt generate karo
    const salt = await bcrypt.genSalt(10);
    
    // Password ko hash karo aur passwordHash field mein save karo
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

// --- Custom Method for Password Matching ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Login ke time entered password ko saved hash se compare karega
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};


const User = mongoose.model('User', userSchema);

module.exports = User;