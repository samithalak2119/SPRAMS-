const express = require('express');
const router = express.Router();
const { serveFile } = require('../../controllers/system/files');
const { protect } = require('../../middleware/auth');

// Authenticated file serving
router.get('/:entryId/:fileId', protect, serveFile);

module.exports = router;
