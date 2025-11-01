// backend/config/db.js

const mongoose = require('mongoose');

// Connection function
const connectDB = async () => {
    try {
        // MongoDB connection string humne .env file se li hai
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // New connection engine ke liye zaroori options
            // Note: In newer Mongoose versions, these options are often default and optional,
            // but including them ensures backward compatibility and clarity.
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Deprecated and removed in Mongoose 6+
            // useFindAndModify: false // Deprecated and removed in Mongoose 6+
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Agar connection fail ho jaye
        console.error(`❌ Error: ${error.message}`);
        
        // Process ko exit kar do
        process.exit(1);
    }
};

module.exports = connectDB;