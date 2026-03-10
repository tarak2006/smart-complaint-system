const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const { getComplaintId, triggerNotification } = require('../utils/azureFunctions');
const { connectAndQuery } = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'complaint-images';

async function uploadToBlob(file) {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error('Azure Storage Connection String is missing');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    await containerClient.createIfNotExists({ access: 'blob' });

    const blobName = `${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    return blockBlobClient.url;
}

async function handleServiceRequest(file, metadata) {
    const photoUrl = await uploadToBlob(file);

    // 1. Get Unique ID from Azure Function
    const complaintId = await getComplaintId();

    // 2. Save to Azure SQL
    const query = `
    INSERT INTO Complaints (ComplaintID, PhotoURL, ApplianceType, Description, Status)
    VALUES ('${complaintId}', '${photoUrl}', '${metadata.applianceType}', '${metadata.description}', 'Pending')
  `;

    try {
        await connectAndQuery(query);
    } catch (sqlError) {
        console.warn('SQL Persistence failed, proceeding with in-memory response:', sqlError.message);
    }

    // 3. Trigger Notification Function
    await triggerNotification(complaintId, 'user@example.com');

    return { complaintId, photoUrl };
}

module.exports = { uploadToBlob, handleServiceRequest };
