// Chat Controller for real-time chat between user and technician
const { connectAndQuery } = require('../config/db');

// Get chat messages for a complaint
async function getChatMessages(complaintId) {
    const query = 'SELECT * FROM ChatMessages WHERE complaint_id = ? ORDER BY created_at ASC';
    const result = await connectAndQuery(query, [complaintId]);
    return result.rows;
}

// Post a new chat message
async function postChatMessage({ complaintId, senderRole, senderId, message }) {
    const query = 'INSERT INTO ChatMessages (complaint_id, sender_role, sender_id, message) VALUES (?, ?, ?, ?)';
    await connectAndQuery(query, [complaintId, senderRole, senderId, message]);
    return { success: true };
}

module.exports = { getChatMessages, postChatMessage };
