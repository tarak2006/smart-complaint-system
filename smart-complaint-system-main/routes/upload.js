const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage } = require('../utils/blobStorage');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const imageUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
        
        if (imageUrl) {
            res.status(200).json({ url: imageUrl });
        } else {
            res.status(500).json({ error: 'Failed to upload to Azure Storage' });
        }
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
