// Chat routes for real-time chat between user and technician
const express = require('express');
const router = express.Router();
const { getChatMessages, postChatMessage } = require('../controllers/chatController');

// GET chat messages for a complaint
router.get('/:complaintId', async (req, res) => {
    try {
        const messages = await getChatMessages(req.params.complaintId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Fetch chat error:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
});

// POST a new chat message
router.post('/', async (req, res) => {
    const { complaintId, senderRole, senderId, message } = req.body;
    if (!complaintId || !senderRole || !senderId || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        await postChatMessage({ complaintId, senderRole, senderId, message });
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Post chat error:', error);
        res.status(500).json({ error: 'Failed to post chat message' });
    }
});

module.exports = router;
