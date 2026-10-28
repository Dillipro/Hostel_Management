const express = require('express');
const multer = require('multer');
const { saveBuffer } = require('../utils/storage');
const { auth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// storage handled by utils/storage.js (local or S3)

router.post('/', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = await saveBuffer(req.user.sub, req.file.buffer, req.file.mimetype, req.file.originalname);
  res.json({ url, name: req.file.originalname, size: req.file.size, type: req.file.mimetype });
});

module.exports = router;
