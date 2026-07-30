const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Different storage for main images and thumbnails
        const isThumbnail = file.fieldname === 'thumbnail';
        const uploadPath = isThumbnail ? 'uploads/thumbnails/' : 'uploads/images/';
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-random-originalname
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
    }
};

// Configure multer for multiple files
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB per file
    },
    fileFilter: fileFilter
});

// Middleware for handling multiple images
const uploadArtwork = upload.fields([
    { name: 'images', maxCount: 10 },      // Multiple artwork images
    { name: 'thumbnail', maxCount: 1 }      // Single thumbnail
]);

module.exports = uploadArtwork;