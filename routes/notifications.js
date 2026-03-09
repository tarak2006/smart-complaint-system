const express = require('express');
const router = express.Router();
const { connectAndQuery } = require('../config/db');

// GET notifications for technician (polling)
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM BotNotifications WHERE status = \'Unread\' ORDER BY created_at DESC';
        const result = await connectAndQuery(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST a new notification (called by bot or other services)
router.post('/', async (req, res) => {
    const { complaint_id, message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const query = 'INSERT INTO BotNotifications (complaint_id, message) VALUES (?, ?)';
        await connectAndQuery(query, [complaint_id || null, message]);
        res.status(201).json({ success: true, message: 'Notification created' });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// PATCH mark notification as read
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'UPDATE BotNotifications SET status = \'Read\' WHERE id = ?';
        await connectAndQuery(query, [id]);
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Update notification error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

module.exports = router;
