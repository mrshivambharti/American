// // server.js ke top par import karo
// // ...
// const socketio = require('socket.io');
// const { initSocket, startEngine } = require('./services/gameEngine'); // Import kiya
// // ...

// // server.js ke top par routes import karo
// // ...
// const authRoutes = require('./routes/authRoutes');
// const walletRoutes = require('./routes/walletRoutes'); // Import kiya
// const gameRoutes = require('./routes/gameRoutes');   // Abhi bhi comment out
// // ...

// // server.js ke top par import karo
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// // backend/server.js

// // Dependencies import karo
// const http = require('http');
// const express = require('express');
// const dotenv = require('dotenv');
// // const socketio = require('socket.io');

// // Environment variables load karo
// // Note: Agar .env file project root mein hai (backend/ ke bahar), toh path adjust karna padega
// dotenv.config({ path: '../.env' }); // Assuming .env is one level up from backend/

// // Database connection function import karo (Hum isko next file mein banayenge)
// const connectDB = require('./config/db');

// // Routes import karo
// // const walletRoutes = require('./routes/walletRoutes'); // Abhi ke liye comment out
// // const gameRoutes = require('./routes/gameRoutes');   // Abhi ke liye comment out

// // Express app aur Server banao
// const app = express();
// const server = http.createServer(app);

// // Socket.io setup karo
// const io = socketio(server, {
//     cors: {
//         origin: "http://localhost:3000", // Frontend URL (Next.js default)
//         methods: ["GET", "POST"]
//     }
// });

// // Database se connect karo
// connectDB();

// // Middleware
// app.use(express.json()); // Body-parser for JSON data

// // Routes setup karo
// app.use('/api/auth', authRoutes);
// app.use('/api/wallet', walletRoutes);
// app.use('/api/game', gameRoutes);

// // Simple root route for testing
// app.get('/', (req, res) => {
//     res.send('American Locus Backend API is running...');
// });

// // --- Socket.io Connection Logic ---
// io.on('connection', (socket) => {
//     console.log(`Socket Connected: ${socket.id}`);

//     // Example: Joining a specific game room
//     // socket.on('joinGame', ({ roundId }) => {
//     //     socket.join(roundId);
//     //     console.log(`User ${socket.id} joined round ${roundId}`);
//     // });

//     // Global event to broadcast round updates (gameEngine se aayega)
//     // socket.emit('roundUpdate', { status: 'Server connected' });

//     socket.on('disconnect', () => {
//         console.log(`Socket Disconnected: ${socket.id}`);
//     });
// });
// // ------------------------------------
// // Game Engine ko Socket.io instance do aur shuru karo
// initSocket(io); 
// startEngine();

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} - (http://localhost:${PORT})`));
// // server.js file ke andar routes ke baad yeh lines add karo
// // ... Routes setup ke baad ...

// // Error Handlers
// app.use(notFound);      // Sabse pehle Not Found handler
// app.use(errorHandler);  // Uske baad General Error handler

// // ... server.listen se pehle ...
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} - (http://localhost:${PORT})`));




// backend/server.js
// backend/server.js

// --- 1. Dependencies Import and Setup ---
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const socketio = require('socket.io'); 
const path = require('path'); 
const cors = require('cors'); // CORS import kiya

// Environment variables load karo
// Note: Assuming .env file project root mein hai (backend/ ke bahar)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); 

// Utility Imports
const connectDB = require('./config/db');

// Middleware Imports
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes'); 
const gameRoutes = require('./routes/gameRoutes');   

// Game Engine Service Imports
const { initSocket, startEngine } = require('./services/gameEngine'); 

// --- 2. Initialization ---
const app = express();
const server = http.createServer(app);

// Database se connect karo
connectDB();

// --- 3. Socket.io Setup ---
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend URL (Next.js default)
        methods: ["GET", "POST"],
        credentials: true, // Add this for completeness, though GET/POST is main
    }
});

// --- 4. Middleware & Routes ---
app.use(express.json()); // Body-parser for JSON data

// 💡 CORS Middleware Added for API Routes 💡
app.use(cors({
    origin: "http://localhost:3000", // Sirf frontend ko access do
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

// Simple root route for testing
app.get('/', (req, res) => {
    res.send('✅ American Locus Backend API is running...');
});

// Routes setup karo
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);

// --- 5. Socket.io Connection Logic ---
io.on('connection', (socket) => {
    // console.log(`Socket Connected: ${socket.id}`);
    socket.on('disconnect', () => {
        // console.log(`Socket Disconnected: ${socket.id}`);
    });
});

// --- 6. Error Handlers ---
app.use(notFound); 
app.use(errorHandler); 

// --- 7. Start Game Engine & Server ---

// Game Engine ko Socket.io instance do aur shuru karo
initSocket(io); 
startEngine();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} - (http://localhost:${PORT})`));