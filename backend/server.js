// ============================================
// DEPENDENCIES
// ============================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ============================================
// IMPORT ROUTES
// ============================================
const artworkRoutes = require('./routes/artworks');

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// 1. CORS - Allow frontend to communicate with backend
app.use(cors({
    origin: 'http://localhost:5173', // React app address
    credentials: true
}));

// 2. JSON Parser - Parse JSON request bodies
app.use(express.json());

// 3. URL Encoded Parser - Parse form data
app.use(express.urlencoded({ extended: true }));

// 4. Static Files - Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Logging Middleware (optional but helpful)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ============================================
// API ROUTES
// ============================================

// Mount artwork routes
app.use('/api/artworks', artworkRoutes);

// Test route to check if server is running
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Art Portfolio API is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Not Found handler
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Multer error handling
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            error: 'File too large. Maximum size is 10MB.' 
        });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
            error: 'Unexpected file field' 
        });
    }
    
    res.status(err.status || 500).json({ 
        error: err.message || 'Internal server error' 
    });
});

// ============================================
// CREATE UPLOADS FOLDER IF IT DOESN'T EXIST
// ============================================
const uploadsDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

// Create directories recursively
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
};

ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(imagesDir);
ensureDirectoryExists(thumbnailsDir);

// ============================================
// CONNECT TO MONGODB
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artportfolio';

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection string: ${MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if can't connect to database
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
});

// ============================================
// START THE SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api/artworks`);
    console.log(`🖼️  Images URL: http://localhost:${PORT}/uploads/`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n✨ Ready to serve your art portfolio!\n`);
});

// ============================================
// EXPORT APP FOR TESTING
// ============================================
module.exports = app;