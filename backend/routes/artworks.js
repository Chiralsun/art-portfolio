const express = require('express');
const router = express.Router();
const uploadArtwork = require('../middleware/upload');
const artworkController = require('../controllers/artworkController');

router.post('/', uploadArtwork, artworkController.createArtwork);
router.get('/', artworkController.getArtworks);
router.get('/filters', artworkController.getFilters);
router.get('/:id', artworkController.getArtwork);
router.put('/:id', uploadArtwork, artworkController.updateArtwork);
router.delete('/:id', artworkController.deleteArtwork);

module.exports = router;