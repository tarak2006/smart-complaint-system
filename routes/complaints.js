const express = require('express');
const router = express.Router();
const {
    handleServiceRequest,
    getComplaintById,
    getAllComplaints,
    updateComplaintStatus
} = require('../controllers/complaintController');

// GET all complaints (for Admin)
router.get('/', async (req, res) => {
    try {
        const result = await getAllComplaints();
        res.status(200).json(result);
    } catch (error) {
        console.error('Fetch all error:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// GET complaint by ID
router.get('/:id', async (req, res) => {
    try {
        const result = await getComplaintById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(404).json({ error: 'Complaint ID not found' });
    }
});

// POST new complaint
router.post('/', async (req, res) => {
    try {
        const result = await handleServiceRequest(req.body);
        res.status(200).json({
            message: 'Complaint registered successfully',
            ...result
        });
    } catch (error) {
        console.error('Complaint registration error:', error);
        res.status(500).json({ error: 'Failed to process complaint' });
    }
});

// PATCH update status
router.patch('/:id', async (req, res) => {
    try {
        const { status, technician } = req.body;
        const result = await updateComplaintStatus(req.params.id, status, technician);
        res.status(200).json(result);
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
