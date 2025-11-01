// backend/middleware/errorMiddleware.js

// --- 1. 404 Not Found Handler ---
const notFound = (req, res, next) => {
    // Ek Error object banao jismein requested URL shamil ho
    const error = new Error(`Not Found - ${req.originalUrl}`);
    // Response status ko 404 set karo
    res.status(404);
    // Error ko next middleware (errorHandler) pe pass karo
    next(error);
};


// --- 2. Custom Error Handler ---
const errorHandler = (err, req, res, next) => {
    // Agar status code 200 hai (default success), toh usko 500 Internal Server Error kar do
    // Otherwise, existing status code rehne do (jo humne controllers/middlewares mein set kiya hai)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode);

    // JSON response client ko bhejenge
    res.json({
        message: err.message,
        // Development mode mein stack trace bhi bhejo, production mein nahi
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        code: statusCode // For clearer client-side handling
    });
};

module.exports = { notFound, errorHandler };