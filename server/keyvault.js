const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

async function loadSecrets() {
    const keyVaultName = process.env.AZURE_KEYVAULT_NAME;
    if (!keyVaultName) {
        console.log("No AZURE_KEYVAULT_NAME provided in .env, falling back to local .env file");
        return;
    }

    const KVUri = `https://${keyVaultName}.vault.azure.net`;
    console.log("Connecting to Azure Key Vault at:", KVUri);

    try {
        // DefaultAzureCredential expects Azure CLI credentials, Managed Identity, or Environment Variables
        const credential = new DefaultAzureCredential();
        const client = new SecretClient(KVUri, credential);

        // List of secrets we expect to fetch from the vault
        const secretNames = [
            "DB-USER",
            "DB-PASSWORD",
            "DB-SERVER",
            "DB-NAME",
            "MicrosoftAppId",
            "MicrosoftAppPassword",
            "MicrosoftAppType",
            "MicrosoftAppTenantId"
        ];

        console.log("Fetching secrets from Azure Key Vault...");
        for (const secretName of secretNames) {
            try {
                const secret = await client.getSecret(secretName);
                if (secret && secret.value) {
                    // Translate Key Vault dashes to environment variable underscores
                    const envVarName = secretName.replace(/-/g, '_');
                    process.env[envVarName] = secret.value;
                    console.log(`Loaded ${secretName} from vault -> process.env.${envVarName}`);
                }
            } catch (err) {
                // Secret might not exist or user doesn't have permissions
                console.warn(`Could not load secret ${secretName}:`, err.message);
            }
        }
        console.log("Finished loading secrets from Key Vault.");
    } catch (error) {
        console.error("Error connecting to Azure Key Vault:", error);
    }
}

module.exports = { loadSecrets };
