module.exports = async function (context, req) {
    context.log('Automated Notification Triggered...');

    const { complaintId, email, message } = req.body;

    if (!email || !complaintId) {
        context.res = {
            status: 400,
            body: "Please pass a complaintId and email in the request body"
        };
        return;
    }

    // Logic for SMS (e.g., Azure Communication Services) or Mail (SendGrid)
    context.log(`Sending Mail to ${email} for Complaint ${complaintId}`);

    context.res = {
        body: `Notification sent for ${complaintId}`
    };
}
