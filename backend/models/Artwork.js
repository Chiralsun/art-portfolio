const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    creationDate: {
        type:Date,
        default: Date.now
    },
    dimensions: {
        height: Number,   // in cm or inches
        width: Number,
        unit: { type: String, default: 'cm' }
    },
    medium: {
        type: String,
        enum: ['Oil', 'Acrylic', 'Watercolor', 'Digital', 'Photography', 'Sculpture', 'Mixed Media', 'Other']
    },
    style: {
        type: String,
        enum: ['Abstract', 'Realism', 'Impressionism', 'Modern', 'Contemporary', 'Minimalist', 'Other']
    },
    price: Number,
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Multiple images support
    images: [{
        url: String,
        isMain: { type: Boolean, default: false },
        caption: String,
        order: Number
    }],
    // For thumbnail/featured display
    thumbnailUrl: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for search
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Artwork', artworkSchema);