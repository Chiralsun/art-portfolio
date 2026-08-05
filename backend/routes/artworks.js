const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const uploadArtwork = require('../middleware/upload');  // This is from .fields()

// Use uploadArtwork (not upload.array)
router.post('/', uploadArtwork, artworkController.createArtwork);
//                ↑ This handles both 'images' and 'thumbnail' fields

router.put('/:id', uploadArtwork, artworkController.updateArtwork);

router.get('/', artworkController.getArtworks);
router.get('/filters', artworkController.getFilters);
router.get('/:id', artworkController.getArtwork);
router.delete('/:id', artworkController.deleteArtwork);

module.exports = router;