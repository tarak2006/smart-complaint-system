const { BlobServiceClient } = require("@azure/storage-blob");
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "complaint-images";

/**
 * Uploads a file buffer to Azure Blob Storage
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - The name to save as
 * @param {string} mimeType - The content type
 * @returns {Promise<string>} - The public URL of the uploaded blob
 */
async function uploadImage(fileBuffer, fileName, mimeType) {
    if (!connectionString) {
        console.log('⚠️ Azure Storage not configured. Skipping upload.');
        return null;
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // Ensure container exists
        await containerClient.createIfNotExists({ access: 'blob' });

        const blobName = `${Date.now()}-${fileName}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        console.log(`Uploading ${blobName} to Azure Blob Storage...`);

        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: mimeType }
        });

        console.log(`✅ Upload complete: ${blockBlobClient.url}`);
        return blockBlobClient.url;
    } catch (error) {
        console.error('❌ Error uploading to Blob Storage:', error.message);
        return null;
    }
}

module.exports = { uploadImage };
