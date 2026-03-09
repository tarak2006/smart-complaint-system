const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const FUNCTION_URL = process.env.AZURE_FUNCTION_URL; // e.g., https://astracare-funcs.azurewebsites.net/api

async function getComplaintId() {
    try {
        if (!FUNCTION_URL) throw new Error('AZURE_FUNCTION_URL is not configured');
        
        console.log('📡 Calling Azure Function (ID Generation)...');
        const response = await axios.get(`${FUNCTION_URL}/GenerateComplaintID`, { timeout: 3000 });
        return response.data.id;
    } catch (error) {
        console.warn(`⚠️ Azure Function (ID Gen) inaccessible (${error.code || error.message}). Using local generator.`);
        const randomHex = Math.random().toString(16).substr(2, 6).toUpperCase();
        return `AST-2026-${randomHex}`;
    }
}

async function triggerNotification(complaintId, userEmail) {
    try {
        if (!FUNCTION_URL) return;
        await axios.post(`${FUNCTION_URL}/SendNotification`, {
            complaintId,
            email: userEmail,
            message: `Your service request ${complaintId} has been successfully registered.`
        }, { timeout: 3000 });
    } catch (error) {
        console.warn(`⚠️ Azure Function (Notification) inaccessible (${error.code || error.message}).`);
    }
}

module.exports = { getComplaintId, triggerNotification };
