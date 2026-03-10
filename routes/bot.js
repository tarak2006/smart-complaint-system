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

**What next?**
• Type **"Suggestions"** for diagnostic tips
• Type **"Contact Technician"** to reach support`;
                    
                    await context.sendActivity(MessageFactory.text(responseText));
                } catch (err) {
                    console.error('❌ Bot Database Error:', err.message);
                    await context.sendActivity(MessageFactory.text("I couldn't find that Complaint ID. Please verify and try again!"));
                }
            }

            // --- 2. Suggestions / Diagnostic Tips ---
            else if (query.includes('suggestion') || query.includes('diagnostic') || query.includes('tips') || query.includes('help')) {
                const suggestionsText = `🛠️ **Diagnostic Suggestions**

**Basic Troubleshooting Steps:**
1. ✓ Check the power supply and fuses
2. ✓ Ensure the appliance has proper ventilation
3. ✓ Reset the device by unplugging for 5 minutes
4. ✓ Check for any error codes on display

**Still having issues?**
Type **"Contact Technician"** to connect with our support team!`;
                
                await context.sendActivity(MessageFactory.text(suggestionsText));
            }

            // --- 3. Escalation / Contact Technician ---
            else if (query.includes('contact') || query.includes('technician') || query.includes('talk')) {
                // Extract ticket ID from context if possible
                const lastTicket = query.match(/(ast-\d{4}-\w+|comp-\w+)/i)?.[0]?.toUpperCase() || null;
                
                try {
                    await connectAndQuery(
                        'INSERT INTO BotNotifications (complaint_id, message) VALUES (?, ?)',
                        [lastTicket, `User is requesting technical assistance. Input: "${rawText}"`]
                    );
                    console.log('✅ Notification sent to technician');
                } catch (err) {
                    console.error('❌ Failed to create bot notification:', err.message);
                }

                await context.sendActivity(MessageFactory.text("Connecting you to our technician portal... 📞\n\nPlease hold on while I notify the assigned specialist.\n\n**Alternatively, call us:**\n📱 1800-ASTRA-CARE"));
            }

            // --- 4. Troubleshooting / Issue Description ---
            else if (['leaking', 'cooling', 'cool', 'noise', 'working', 'broken', 'not working', 'damage', 'issue'].some(kw => query.includes(kw))) {
                 await context.sendActivity(MessageFactory.text("I see you're having trouble with your appliance. 🛠️\n\n**Quick questions:**\n• Is it plugged in?\n• Any error codes on the display?\n\n**To help you better:**\n1️⃣ Share your complaint **Ticket ID** (e.g., AST-2026-XXXX) for detailed status\n2️⃣ Type **\"Suggestions\"** for troubleshooting tips\n3️⃣ Type **\"Contact Technician\"** to reach our support team"));
            }

            // --- 5. General Interaction ---
            else if (query.includes('hi') || query.includes('hello')) {
                await context.sendActivity(MessageFactory.text("👋 Hello! I'm **Astra**, your AI service assistant.\n\n**How can I help?**\n📍 Share a **Complaint ID** to check status\n💡 Type **\"Suggestions\"** for troubleshooting tips\n👨‍🔧 Type **\"Contact Technician\"** to reach support\n\nWhat would you like to do?"));
            } else {
                await context.sendActivity(MessageFactory.text(`I'm **Astra**! 🤖\n\n**I can help you with:**\n✓ Check status: Share your **Complaint ID** (e.g., AST-2026-XXXX)\n✓ Get tips: Type **\"Suggestions\"** for diagnostic help\n✓ Contact support: Type **\"Contact Technician\"**\n\nWhat would you like?`));
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

