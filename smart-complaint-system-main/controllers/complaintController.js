const { getComplaintId } = require('../utils/azureFunctions');
const { sendEmailNotification, sendSmsNotification } = require('../utils/notifications');
const { sql, poolPromise } = require('../config/db');

async function handleServiceRequest(metadata) {
    try {
        console.log('Registering new complaint for:', metadata.userName || 'Unknown');
        const complaintId = await getComplaintId();
        const pool = await poolPromise;

        const query = `
        INSERT INTO Complaints (
            complaint_id, user_id, appliance_type, appliance_brand,
            issue_description, address, preferred_pickup_date,
            service_status, technician_assigned, image_url
        )
        VALUES (@complaint_id, @user_id, @appliance_type, @appliance_brand, @issue_description, @address, @preferred_pickup_date, @service_status, @technician_assigned, @image_url)
        `;

        await pool.request()
            .input('complaint_id', sql.NVarChar, complaintId)
            .input('user_id', sql.Int, metadata.userId || 1)
            .input('appliance_type', sql.NVarChar, metadata.applianceType)
            .input('appliance_brand', sql.NVarChar, metadata.applianceBrand || '')
            .input('issue_description', sql.NVarChar, metadata.issue || '')
            .input('address', sql.NVarChar, metadata.address || '')
            .input('preferred_pickup_date', sql.NVarChar, metadata.date || '')
            .input('service_status', sql.NVarChar, 'Pending')
            .input('technician_assigned', sql.NVarChar, 'Not Assigned')
            .input('image_url', sql.NVarChar, metadata.imageUrl || null)
            .query(query);

        console.log('Successfully stored in Azure SQL:', complaintId);
        
        // --- ACS Notifications (Email & SMS) ---
        const customerEmail = metadata.email || 'service@astracare.com';
        // Sanitize phone number (remove spaces/dashes for E.164 format)
        const customerPhone = metadata.phone ? metadata.phone.replace(/[\s-]/g, '') : null;

        await sendEmailNotification(
            customerEmail,
            `Complaint Registered: ${complaintId}`,
            `Hello ${metadata.userName || 'Customer'},\n\nYour complaint for ${metadata.applianceType} has been successfully registered. \n\nTicket ID: ${complaintId}\nStatus: Pending\n\nThank you for choosing UrbanCare!`
        );

        if (customerPhone) {
            await sendSmsNotification(
                customerPhone,
                `UrbanCare: Your ticket ${complaintId} is registered! We will dispatch a mechanic soon.`
            );
        }

        return { success: true, ticketId: complaintId, status: 'Pending' };
    } catch (err) {
        console.error('Failed to log to Azure SQL:', err.message);
        throw err;
    }
}

async function getComplaintById(complaintId) {
    const pool = await poolPromise;
    const query = `
    SELECT
        c.*, u.name AS customer_name
    FROM Complaints c
    LEFT JOIN Users u ON c.user_id = u.id
    WHERE c.complaint_id = @complaint_id
    `;
    
    const result = await pool.request()
        .input('complaint_id', sql.NVarChar, complaintId)
        .query(query);

    if (result.recordset.length > 0) {
        const row = result.recordset[0];

        return {
            complaintId: row.complaint_id,
            customerName: row.customer_name || 'Anonymous',
            applianceType: row.appliance_type,
            applianceBrand: row.appliance_brand,
            issueDescription: row.issue_description,
            address: row.address,
            pickupDate: row.preferred_pickup_date,
            complaintDate: row.complaint_date,
            status: row.service_status || row.status, // Handle both naming conventions
            technician: row.technician_assigned,
            imageUrl: row.image_url
        };
    }
    throw new Error('Complaint not found');
}

async function getAllComplaints() {
    const pool = await poolPromise;
    const query = `
    SELECT c.*, u.name AS customer_name FROM Complaints c
    LEFT JOIN Users u ON c.user_id = u.id
    ORDER BY c.complaint_date DESC
    `;
    const result = await pool.request().query(query);
    
    return result.recordset.map(row => ({
        complaintId: row.complaint_id,
        customerName: row.customer_name || 'Anonymous',
        applianceType: row.appliance_type,
        applianceBrand: row.appliance_brand,
        status: row.service_status || row.status,
        technician: row.technician_assigned
    }));
}

async function updateComplaintStatus(complaintId, status, technician = null) {
    const pool = await poolPromise;
    let query = `UPDATE Complaints SET service_status = @status`;
    if (technician) {
        query += `, technician_assigned = @technician`;
    }
    query += ` WHERE complaint_id = @complaint_id`;

    const request = pool.request()
        .input('status', sql.NVarChar, status)
        .input('complaint_id', sql.NVarChar, complaintId);
    
    if (technician) {
        request.input('technician', sql.NVarChar, technician);
    }

    await request.query(query);
    return { success: true };
}

module.exports = { handleServiceRequest, getComplaintById, getAllComplaints, updateComplaintStatus };

