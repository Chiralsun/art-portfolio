const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary-v2');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // Folder structure in Cloudinary
        folder: 'art-gallery',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ quality: 'auto' }], // Auto-optimize images
        
        // Generate unique filename and folder path
        public_id: (req, file) => {
            // Create unique filename: timestamp-random
            const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
            
            // Different folders for images vs thumbnails
            if (file.fieldname === 'thumbnail') {
                return `thumbnails/${unique}`;  // Stores in thumbnails/ folder
            }
            return `images/${unique}`;  // Stores in images/ folder
        }
    }
});

// File filter for images (only allow image files)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);  // Accept the file
    } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);  // Reject the file
    }
};

// Configure multer with Cloudinary storage
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