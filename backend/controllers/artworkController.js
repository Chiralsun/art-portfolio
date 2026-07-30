const Artwork = require('../models/Artwork');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image processing

// Create artwork with multiple images
exports.createArtwork = async (req, res) => {
    try {
        const { title, description, year, dimensions, medium, style, price, isAvailable, tags } = req.body;
        
        // Process uploaded images
        const images = [];
        let thumbnailUrl = '';

        // Handle multiple images
        if (req.files && req.files.images) {
            req.files.images.forEach((file, index) => {
                const isMain = index === 0; // First image is main by default
                images.push({
                    url: `/uploads/images/${file.filename}`,
                    isMain: isMain,
                    order: index
                });
            });
        }

        // Handle thumbnail (or use first image as thumbnail)
        if (req.files && req.files.thumbnail) {
            thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
        } else if (images.length > 0) {
            thumbnailUrl = images[0].url;
        } else {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        // Parse dimensions if provided
        let parsedDimensions = {};
        if (dimensions) {
            try {
                parsedDimensions = JSON.parse(dimensions);
            } catch (e) {
                parsedDimensions = dimensions;
            }
        }

        const artwork = new Artwork({
            title,
            description,
            year: year || undefined,
            dimensions: parsedDimensions,
            medium,
            style,
            price: price || undefined,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            images,
            thumbnailUrl,
            tags: tags ? JSON.parse(tags) : [],
            featured: req.body.featured === 'true'
        });

        await artwork.save();
        res.status(201).json(artwork);
    } catch (error) {
        // Clean up uploaded files on error
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(400).json({ error: error.message });
    }
};

// Get all artworks with filtering
exports.getArtworks = async (req, res) => {
    try {
        const { medium, style, year, featured, search, limit } = req.query;
        
        let filter = {};
        if (medium) filter.medium = medium;
        if (style) filter.style = style;
        if (year) filter.year = parseInt(year);
        if (featured === 'true') filter.featured = true;
        if (search) {
            filter.$text = { $search: search };
        }

        const query = Artwork.find(filter);
        
        if (limit) {
            query.limit(parseInt(limit));
        }

        const artworks = await query.sort({ createdAt: -1 });
        res.json(artworks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single artwork with full details
exports.getArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }
        res.json(artwork);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update artwork
exports.updateArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        const updates = req.body;
        
        // Handle image updates
        if (req.files) {
            // Delete old images if new ones are uploaded
            if (req.files.images) {
                // Delete old image files
                artwork.images.forEach(img => {
                    const oldPath = path.join(__dirname, '..', img.url);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                });
                
                // Add new images
                const newImages = req.files.images.map((file, index) => ({
                    url: `/uploads/images/${file.filename}`,
                    isMain: index === 0,
                    order: index
                }));
                artwork.images = newImages;
            }

            // Update thumbnail
            if (req.files.thumbnail) {
                // Delete old thumbnail
                const oldThumbPath = path.join(__dirname, '..', artwork.thumbnailUrl);
                if (fs.existsSync(oldThumbPath)) {
                    fs.unlinkSync(oldThumbPath);
                }
                artwork.thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
            }
        }

        // Update other fields
        if (updates.title) artwork.title = updates.title;
        if (updates.description) artwork.description = updates.description;
        if (updates.year) artwork.year = updates.year;
        if (updates.dimensions) {
            try {
                artwork.dimensions = JSON.parse(updates.dimensions);
            } catch (e) {
                artwork.dimensions = updates.dimensions;
            }
        }
        if (updates.medium) artwork.medium = updates.medium;
        if (updates.style) artwork.style = updates.style;
        if (updates.price) artwork.price = updates.price;
        if (updates.isAvailable !== undefined) artwork.isAvailable = updates.isAvailable === 'true';
        if (updates.featured !== undefined) artwork.featured = updates.featured === 'true';
        if (updates.tags) artwork.tags = JSON.parse(updates.tags);

        await artwork.save();
        res.json(artwork);
    } catch (error) {
        // Clean up newly uploaded files
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        res.status(400).json({ error: error.message });
    }
};

// Delete artwork
exports.deleteArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        // Delete all images
        [...artwork.images, { url: artwork.thumbnailUrl }].forEach(img => {
            const filePath = path.join(__dirname, '..', img.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await artwork.deleteOne();
        res.json({ message: 'Artwork deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all available filters
exports.getFilters = async (req, res) => {
    try {
        const mediums = await Artwork.distinct('medium');
        const styles = await Artwork.distinct('style');
        const years = await Artwork.distinct('year');
        
        res.json({
            mediums: mediums.filter(m => m),
            styles: styles.filter(s => s),
            years: years.filter(y => y)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};