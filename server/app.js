const express = require('express');
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    ActivityHandler,
    MessageFactory
} = require('botbuilder');
require('dotenv').config();

async function startServer() {
    // Import Key Vault loader
    const { loadSecrets } = require('./keyvault');
    
    // 1. Load Secrets heavily modifying process.env
    await loadSecrets();

    // Import the database function from your db.js file after loadSecrets
    const { createComplaint } = require('./db');

    const app = express();
    const cors = require('cors');
    app.use(cors()); // This allows your frontend to talk to your backend

    // Express's built-in body parser
    app.use(express.json());

    // 2. Setup Bot Credentials (from your dynamically loaded .env payload)
    const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
        MicrosoftAppId: process.env.MicrosoftAppId,
        MicrosoftAppPassword: process.env.MicrosoftAppPassword,
        MicrosoftAppType: process.env.MicrosoftAppType,
        MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
    });

    const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
    const adapter = new CloudAdapter(botFrameworkAuthentication);
    
    // Error handler
    adapter.onTurnError = async (context, error) => {
        console.error(`\n [onTurnError] unhandled error: ${error}`);
        await context.sendActivity('The bot encountered an error connecting to the system.');
    };

    // 2. Define the Complaint Bot Logic
    class SmartHomeComplaintBot extends ActivityHandler {
        constructor() {
            super();

            this.onMessage(async (context, next) => {
                const userMessage = context.activity.text.trim();

                // 1. Check if user is asking for Ticket Status (COMP-XXXX pattern)
                if (userMessage.toUpperCase().startsWith("COMP-")) {
                    const ticketId = userMessage.toUpperCase();
                    const { getComplaintById } = require('./db');
                    
                    await context.sendActivity(`Looking up status for **${ticketId}**...`);
                    const ticket = await getComplaintById(ticketId);

                    if (ticket) {
                        const status = ticket.status || "Pending Review";
                        const reply = `Ticket Found!\n\n**Appliance:** ${ticket.appliance_type} (${ticket.appliance_brand})\n**Status:** ${status}\n**Reported Issue:** ${ticket.issue_description}`;
                        await context.sendActivity(reply);
                    } else {
                        await context.sendActivity("I couldn't find a ticket with that ID. Please check the number and try again.");
                    }
                    return await next();
                }

                // 2. Simple Troubleshooting Logic
                const lowers = userMessage.toLowerCase();
                const isTroubleshootingIssue = lowers.includes("leaking") || lowers.includes("not cool") || lowers.includes("noise");
                
                if (isTroubleshootingIssue && !lowers.includes("book repair")) {
                    await context.sendActivity("I've analyzed your issue. Before we book a repair, please try these quick steps:");
                    
                    let suggestion = "1. Check if the power cord is loose.\n2. Ensure there is 5 inches of space behind the appliance for airflow.";
                    if (lowers.includes("cool")) suggestion += "\n3. Clean the condenser coils at the back.";
                    
                    await context.sendActivity(suggestion);
                    await context.sendActivity("Did that fix the problem? If not, type **'Book Repair'** and I'll send a mechanic.");
                    return await next();
                }

                // 3. Complaint Creation Logic (Initial or Escalated)
                await context.sendActivity("Checking the system and logging your request...");

                try {
                    const dummyUserId = 1;
                    const applianceType = "Pending AI Extraction";
                    const applianceBrand = "Pending AI Extraction";
                    const userAddress = "User Home Address";
                    const preferredDate = new Date().toISOString().split('T')[0];

                    const newTicketId = await createComplaint(
                        dummyUserId,
                        applianceType,
                        applianceBrand,
                        userMessage,
                        userAddress,
                        preferredDate
                    );

                    const replyText = `Success! I have logged your issue. Your official tracking ID is **${newTicketId}**.`;
                    await context.sendActivity(MessageFactory.text(replyText, replyText));

                } catch (error) {
                    console.error(error);
                    await context.sendActivity("Sorry, I could not reach the database to save your ticket.");
                }

                await next();
            });

            // When a user first opens the chat
            this.onMembersAdded(async (context, next) => {
                const membersAdded = context.activity.membersAdded;
                const welcomeText = 'Welcome to the Smart Home Service Portal! Please describe your appliance issue.';
                for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                    if (membersAdded[cnt].id !== context.activity.recipient.id) {
                        await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                    }
                }
                await next();
            });
        }
    }

    const bot = new SmartHomeComplaintBot();

    // 3. Create the endpoint for Azure to hit
    app.post('/api/messages', async (req, res) => {
        await adapter.process(req, res, (context) => bot.run(context));
    });

    // --- ENDPOINT TO RECEIVE DATA FROM FRONTEND ---
    app.post('/api/submit-complaint', async (req, res) => {
        try {
            // Extract the data sent from the frontend HTML form
            const { userId, applianceType, applianceBrand, issue, address, date } = req.body;

            // Send it to the Azure SQL Database
            const newTicketId = await createComplaint(
                userId, applianceType, applianceBrand, issue, address, date
            );

            // Send a success response back to the frontend
            if (newTicketId) {
                res.status(200).json({ success: true, ticketId: newTicketId });
            } else {
                res.status(500).json({ success: false, message: "Failed to generate ticket ID." });
            }
        } catch (error) {
            console.error("Error saving complaint:", error);
            res.status(500).json({ success: false, message: "Database connection error." });
        }
    });

    // --- TEMPORARY DATABASE TEST ROUTE ---
    app.get('/test-db', async (req, res) => {
        try {
            console.log("Attempting to connect to Azure SQL and insert data...");

            const newTicketId = await createComplaint(
                1, "Refrigerator", "Samsung", "Testing the database connection from the browser!", "123 Smart Home Ave", "2026-03-07"
            );

            if (newTicketId) {
                res.send(`<h1>Database Test Successful!</h1>
                          <p>Your connection works. A new complaint was saved with Ticket ID: <b>${newTicketId}</b></p>
                          <p>Go check your Azure SQL Query Editor to see the row!</p>`);
            } else {
                res.status(500).send("<h1>Failed</h1><p>Function ran, but no Ticket ID was returned. Check terminal for errors.</p>");
            }
        } catch (error) {
            console.error("Test Route Error:", error);
            res.status(500).send(`<h1>Database Connection Error</h1><p>${error.message}</p>`);
        }
    });

    // 4. Start the Express Server
    const PORT = process.env.BOT_PORT || 3978;
    app.listen(PORT, () => {
        console.log(`\nBot Backend running at http://localhost:${PORT}`);
        console.log(`Endpoint for Emulator/Azure: http://localhost:${PORT}/api/messages`);
    });
}

// Start the server
startServer().catch(err => {
    console.error("Failed to start server:", err);
});