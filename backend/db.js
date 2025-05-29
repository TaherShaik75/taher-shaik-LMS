// backend/db.js
console.log('[DB_LOG] Attempting to load db.js module...'); // NEW LOG
const mongoose = require('mongoose');

const connectDB = async () => {
    console.log('[DB_LOG] connectDB function called.'); // NEW LOG
    try {
        console.log('[DB_LOG] MONGODB_URI from env:', process.env.MONGODB_URI ? 'Exists' : 'MISSING or UNDEFINED'); // NEW LOG
        if (!process.env.MONGODB_URI) {
            console.error('[DB_LOG] MONGODB_URI is not defined in .env file or Vercel environment.'); // MODIFIED LOG
            throw new Error('MONGODB_URI is not defined in .env file or Vercel environment.');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[DB_LOG] MongoDB Connected Successfully to: ${conn.connection.name} on host: ${conn.connection.host}`); // MODIFIED LOG
    } catch (err) {
        console.error('[DB_LOG] MongoDB Connection Error:', err.message, err.stack); // MODIFIED LOG, added stack
        // For Vercel, avoid process.exit(1) initially to see logs
        // process.exit(1); // Exit process with failure 
        // Instead, rethrow or log prominently for Vercel debugging if logs are still empty
        console.error('[DB_LOG] CRITICAL: MongoDB connection failed. Server will likely not operate correctly.');
        throw err; // Re-throw to ensure Vercel logs it if possible
    }
};

module.exports = connectDB;