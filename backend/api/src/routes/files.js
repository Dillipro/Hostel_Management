const express = require('express');
const { getFile } = require('../utils/storage');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Serve file by ID from database blob storage
router.get('/:fileId', auth, async (req, res) => {
  try {
    const file = await getFile(req.params.fileId);

    // Set appropriate headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);

    // Send the file data
    res.send(file.data);
  } catch (error) {
    console.error('Error serving file:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get file metadata without serving the file
router.get('/:fileId/meta', auth, async (req, res) => {
  try {
    const file = await getFile(req.params.fileId);

    // Return metadata without the actual file data
    res.json({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;