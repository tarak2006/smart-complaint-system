const express = require('express');
const router = express.Router();
const { CloudAdapter, ConfigurationServiceClientCredentialFactory, createBotFrameworkAuthenticationFromConfiguration, ActivityHandler, MessageFactory } = require('botbuilder');
const { getComplaintById } = require('../controllers/complaintController');
const { connectAndQuery } = require('../config/db');

console.log('🔄 Bot Route: Version 3.5 (Ultra-Stable Local Mode)');

// 1. Create Bot Framework Authentication
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId || '',
    MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
    MicrosoftAppType: process.env.MicrosoftAppType || 'MultiTenant',
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId || '',
    MicrosoftAppMSIResourceId: process.env.MicrosoftAppMSIResourceId || ''
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
const adapter = new CloudAdapter(botFrameworkAuthentication);

// 2b. Create Anonymous Adapter for local testing (bypasses 401 if no auth header)
const anonymousAuth = createBotFrameworkAuthenticationFromConfiguration(null, new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: '',
    MicrosoftAppPassword: ''
}));
const anonymousAdapter = new CloudAdapter(anonymousAuth);

// 3. Define Bot Logic (Activity Handler)
class AstraBot extends ActivityHandler {
    constructor() {
        super();
        
        this.onMessage(async (context, next) => {
            const query = context.activity.text?.toLowerCase() || '';
            const rawText = context.activity.text;

            console.log(`🤖 Processing message: "${rawText}"`);

            // --- 1. Ticket Tracking with Technician Details ---
            const ticketMatch = query.match(/(ast-\d{4}-\w+|comp-\w+)/i);
            if (ticketMatch) {
                try {
                    const complaintId = ticketMatch[0].toUpperCase();
                    console.log(`🔍 Searching for complaint: ${complaintId}`);
                    const data = await getComplaintById(complaintId);
                    
                    const responseText = `📍 **Complaint Status Found!**
                    
**Ticket ID**: ${data.complaintId}
**Status**: ${data.status}
**Appliance**: ${data.applianceType} (${data.applianceBrand})
**Technician**: ${data.technician || 'Not Assigned Yet'}
**Issue**: ${data.issueDescription}

**Diagnostic Suggestions**:
1. Check the power supply and fuses.
2. Ensure the appliance has proper ventilation.
3. Reset the device by unplugging for 5 minutes.

**Not satisfied?** Type **"Contact Technician"** to speak with ${data.technician || 'our support lead'}.`;
                    
                    await context.sendActivity(MessageFactory.text(responseText));
                } catch (err) {
                    console.error('❌ Bot Database Error:', err.message);
                    await context.sendActivity(MessageFactory.text("I couldn't find that Complaint ID. Please verify and try again!"));
                }
            }

            // --- 2. Escalation / Contact Technician ---
            else if (query.includes('contact') || query.includes('technician') || query.includes('talk')) {
                // Extract ticket ID from context if possible
                const lastTicket = query.match(/(ast-\d{4}-\w+|comp-\w+)/i)?.[0]?.toUpperCase() || null;
                if (!lastTicket) {
                    await context.sendActivity(MessageFactory.text("To connect you with a technician, please provide your Complaint ID (e.g., AST-2026-XXXX or COMP-XXXX)."));
                    return;
                }
                try {
                    await connectAndQuery(
                        'INSERT INTO BotNotifications (complaint_id, message) VALUES (?, ?)',
                        [lastTicket, `User is requesting technical assistance. Input: "${rawText}"`]
                    );
                    console.log('✅ Notification sent to technician');
                } catch (err) {
                    console.error('❌ Failed to create bot notification:', err.message);
                }
                await context.sendActivity(MessageFactory.text("Connecting you to our technician portal... 📞\n\nPlease hold on while I notify the assigned specialist. Alternatively, you can call our priority line: **1800-ASTRA-CARE**."));
            }

            // --- 3. Troubleshooting / Suggestions (Pre-emptive) ---
            else if (['leaking', 'cooling', 'cool', 'noise', 'working'].some(kw => query.includes(kw))) {
                 await context.sendActivity(MessageFactory.text("I've noticed you're having trouble with your appliance. 🛠️\n\n**Quick Check:**\n- Is it plugged in?\n- Are there any error codes on the display?\n\nIf you have a ticket, please share the **ID** (e.g., AST-2026-XXXX) for a detailed status!"));
            }

            // --- 4. General Interaction ---
            else if (query.includes('hi') || query.includes('hello')) {
                await context.sendActivity(MessageFactory.text("Hello! I'm Astra, your AI service assistant. Give me a Complaint ID to track status, or describe your issue for suggestions!"));
            } else {
                await context.sendActivity(MessageFactory.text(`I'm Astra! I can help you track "${rawText}" if you provide a valid Complaint ID, or help you troubleshoot your appliances.`));
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text('Welcome! I am Astra, your Azure AI Support Bot. 🤖⚡'));
                }
            }
            await next();
        });
    }
}

const bot = new AstraBot();

// 4. Endpoint for Bot Messages
router.post('/messages', async (req, res) => {
    const hasAuth = !!req.headers.authorization;
    
    if (hasAuth) {
        // Production/Authenticated flow
        try {
            await adapter.process(req, res, async (context) => {
                await bot.run(context);
            });
        } catch (err) {
            console.error('❌ Authenticated Bot Error:', err);
            res.status(500).json({ error: 'Bot Error' });
        }
        return;
    }

    // --- LOCAL / ANONYMOUS FLOW (Synchronous) ---
    console.log(`🤖 Bot Route: Using Local/Sync flow for Anonymous request`);
    const activities = [];
    const activity = req.body;

    // Minimal TurnContext Mock for AstraBot
    const context = {
        activity: activity,
        sendActivity: async (activityOrText) => {
            const bActivity = typeof activityOrText === 'string' ? MessageFactory.text(activityOrText) : activityOrText;
            activities.push(bActivity);
            return { id: `local-${Date.now()}` };
        },
        turnState: new Map()
    };

    try {
        await bot.run(context);
        res.status(200).json(activities);
    } catch (err) {
        console.error('❌ Local Bot Error:', err);
        res.status(500).json({ error: 'Local Bot Logic Error', message: err.message });
    }
});

module.exports = router;

