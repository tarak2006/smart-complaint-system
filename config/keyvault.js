const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const vaultName = process.env.AZURE_KEYVAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const client = new SecretClient(url, credential);

async function getSecret(secretName) {
    try {
        const secret = await client.getSecret(secretName);
        return secret.value;
    } catch (error) {
        console.error(`Error fetching secret ${secretName} from Key Vault:`, error.message);
        // Fallback to environment variable for local dev
        return process.env[secretName];
    }
}

module.exports = { getSecret };
