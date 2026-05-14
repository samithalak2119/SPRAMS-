const path = require('path');
const fs = require('fs');
const ResearchEntry = require('../../models/ResearchEntry');

// @desc    Serve a protected file
// @route   GET /api/files/:entryId/:fileId
// @access  Private (authenticated users only)
const serveFile = async (req, res, next) => {
    try {
        const { entryId, fileId } = req.params;

        const entry = await ResearchEntry.findById(entryId);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Research entry not found' });
        }

        const file = entry.files.find((f) => f._id.toString() === fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Security: Verify file exists on disk
        if (!fs.existsSync(file.filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        // Security: Prevent path traversal — ensure path is within uploads dir
        const uploadsDir = path.resolve(path.join(__dirname, '../../uploads'));
        const resolvedPath = path.resolve(file.filePath);

        if (!resolvedPath.startsWith(uploadsDir)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.setHeader('Content-Type', file.fileType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
        res.setHeader('Cache-Control', 'private, max-age=3600');

        const fileStream = fs.createReadStream(resolvedPath);
        fileStream.on('error', (err) => {
            next(err);
        });
        fileStream.pipe(res);
    } catch (error) {
        next(error);
    }
};

module.exports = { serveFile };
