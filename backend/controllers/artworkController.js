const Artwork = require('../models/Artwork');
const cloudinary = require('../config/cloudinary');  // ✅ NEW: Cloudinary import

// ============================================
// CREATE ARTWORK
// ============================================
exports.createArtwork = async (req, res) => {
    try {
        const { title, description, creationDate, dimensions, medium, style, price, isAvailable, tags } = req.body;
        
        const images = [];
        let thumbnailUrl = '';
        let thumbnailPublicId = '';  // ✅ NEW: For Cloudinary deletion

        // Process uploaded images
        if (req.files && req.files.images) {
            req.files.images.forEach((file, index) => {
                const isMain = index === 0;
                images.push({
                    url: file.path,           // ✅ Cloudinary URL
                    publicId: file.filename,  // ✅ Cloudinary public ID
                    isMain: isMain,
                    order: index
                });
            });
        }

        // Process thumbnail
        if (req.files && req.files.thumbnail) {
            thumbnailUrl = req.files.thumbnail[0].path;           // ✅ Cloudinary URL
            thumbnailPublicId = req.files.thumbnail[0].filename;  // ✅ Cloudinary public ID
        } else if (images.length > 0) {
            thumbnailUrl = images[0].url;
            thumbnailPublicId = images[0].publicId;
        } else {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        // Parse dimensions
        let parsedDimensions = {};
        if (dimensions) {
            try {
                parsedDimensions = JSON.parse(dimensions);
            } catch (e) {
                parsedDimensions = dimensions;
            }
        }

        // Create artwork
        const artwork = new Artwork({
            title,
            description,
            creationDate: creationDate ? new Date(creationDate) : new Date(),
            dimensions: parsedDimensions,
            medium,
            style,
            price: price || undefined,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            images,
            thumbnailUrl,
            thumbnailPublicId,  // ✅ NEW: Save for deletion
            tags: tags ? JSON.parse(tags) : [],
            featured: req.body.featured === 'true'
        });

        await artwork.save();
        res.status(201).json(artwork);

    } catch (error) {
        // ✅ NEW: Clean up Cloudinary uploads on error
        if (req.files) {
            const allFiles = Object.values(req.files).flat();
            for (const file of allFiles) {
                if (file.filename) {
                    await cloudinary.uploader.destroy(file.filename);
                }
            }
        }
        res.status(400).json({ error: error.message });
    }
};

// ============================================
// GET ALL ARTWORKS
// ============================================
exports.getArtworks = async (req, res) => {
    try {
        const { medium, style, year, featured, search, limit } = req.query;
        
        let filter = {};
        if (medium) filter.medium = medium;
        if (style) filter.style = style;
        
        if (year) {
            const yearNum = parseInt(year);
            filter.creationDate = {
                $gte: new Date(`${yearNum}-01-01`),
                $lt: new Date(`${yearNum + 1}-01-01`)
            };
        }
        
        if (featured === 'true') filter.featured = true;
        if (search) {
            filter.$text = { $search: search };
        }

        const query = Artwork.find(filter);
        
        if (limit) {
            query.limit(parseInt(limit));
        }

        const artworks = await query.sort({ creationDate: -1 });
        res.json(artworks);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// GET SINGLE ARTWORK
// ============================================
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

// ============================================
// UPDATE ARTWORK
// ============================================
exports.updateArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        const updates = req.body;
        
        // ✅ UPDATED: Handle image updates with Cloudinary
        if (req.files) {
            // Handle main images
            if (req.files.images) {
                // Delete old images from Cloudinary
                for (const img of artwork.images) {
                    if (img.publicId) {
                        await cloudinary.uploader.destroy(img.publicId);
                    }
                }
                
                // Save new images with Cloudinary URLs
                const newImages = req.files.images.map((file, index) => ({
                    url: file.path,
                    publicId: file.filename,
                    isMain: index === 0,
                    order: index
                }));
                artwork.images = newImages;
            }

            // Handle thumbnail
            if (req.files.thumbnail) {
                // Delete old thumbnail from Cloudinary
                if (artwork.thumbnailPublicId) {
                    await cloudinary.uploader.destroy(artwork.thumbnailPublicId);
                }
                
                // Save new thumbnail
                artwork.thumbnailUrl = req.files.thumbnail[0].path;
                artwork.thumbnailPublicId = req.files.thumbnail[0].filename;
            }
        }

        // Update other fields (unchanged)
        if (updates.title) artwork.title = updates.title;
        if (updates.description) artwork.description = updates.description;
        if (updates.creationDate) artwork.creationDate = new Date(updates.creationDate);
        
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
        // ✅ NEW: Clean up Cloudinary uploads on error
        if (req.files) {
            const allFiles = Object.values(req.files).flat();
            for (const file of allFiles) {
                if (file.filename) {
                    await cloudinary.uploader.destroy(file.filename);
                }
            }
        }
        res.status(400).json({ error: error.message });
    }
};

// ============================================
// DELETE ARTWORK
// ============================================
exports.deleteArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ error: 'Artwork not found' });
        }

        // ✅ NEW: Delete images from Cloudinary
        for (const img of artwork.images) {
            if (img.publicId) {
                await cloudinary.uploader.destroy(img.publicId);
            }
        }
        
        // ✅ NEW: Delete thumbnail from Cloudinary
        if (artwork.thumbnailPublicId) {
            await cloudinary.uploader.destroy(artwork.thumbnailPublicId);
        }

        await artwork.deleteOne();
        res.json({ message: 'Artwork deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// GET FILTERS
// ============================================
exports.getFilters = async (req, res) => {
    try {
        const mediums = await Artwork.distinct('medium');
        const styles = await Artwork.distinct('style');
        
        const artworks = await Artwork.find({}, 'creationDate');
        const years = [...new Set(artworks.map(a => 
            a.creationDate ? a.creationDate.getFullYear() : null
        ))].filter(y => y).sort((a, b) => b - a);
        
        res.json({
            mediums: mediums.filter(m => m),
            styles: styles.filter(s => s),
            years: years
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};