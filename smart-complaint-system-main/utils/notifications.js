const { EmailClient } = require("@azure/communication-email");
const { SmsClient } = require("@azure/communication-sms");
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.ACS_CONNECTION_STRING;
const emailSender = process.env.ACS_EMAIL_SENDER;
const smsSender = process.env.ACS_SMS_PHONE_NUMBER;

// Initialize clients only if connection string exists
const emailClient = connectionString ? new EmailClient(connectionString) : null;
const smsClient = connectionString ? new SmsClient(connectionString) : null;

/**
 * Sends an email notification using Azure Communication Services
 */
async function sendEmailNotification(to, subject, body) {
  if (!emailClient || !emailSender) {
    console.log('⚠️ ACS Email not configured. Skipping email to:', to);
    return;
  }

  try {
    const message = {
      senderAddress: emailSender,
      content: {
        subject: subject,
        plainText: body,
      },
      recipients: {
        to: [{ address: to }],
      },
    };

    const poller = await emailClient.beginSend(message);
    const result = await poller.pollUntilDone();
    
    if (result.status === "Succeeded") {
      console.log('✅ Email sent successfully to:', to, 'ID:', result.id);
    } else {
      console.error('❌ Email failed or suppressed. Status:', result.status, 'Error:', result.error);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending email via ACS:', error.message);
  }
}

/**
 * Sends an SMS notification using Azure Communication Services
 */
async function sendSmsNotification(to, messageText) {
  if (!smsClient || !smsSender) {
    console.log('⚠️ ACS SMS not configured. Skipping SMS to:', to);
    return;
  }

  try {
    const sendResults = await smsClient.send({
      from: smsSender,
      to: [to],
      message: messageText
    });

    for (const res of sendResults) {
      if (res.successful) {
        console.log("✅ SMS sent successfully to:", res.to, "ID:", res.messageId);
      } else {
        console.error("❌ SMS failed to send to:", res.to, "Error:", res.errorMessage);
      }
    }
  } catch (error) {
    console.error("❌ Error sending SMS via ACS:", error.message);
  }
}

module.exports = { sendEmailNotification, sendSmsNotification };
