import nodemailer from 'nodemailer';
import config from './config.js';
import { updateClient } from './dbClient.js';

// Create SMTP transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });
};

/**
 * Sends an email to a client
 * @param {Object} client - Client object with email details
 * @returns {Promise<Object>} - Send result
 */
export const sendEmail = async (client) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `${config.business.name} <${config.business.email}>`,
        to: client.email,
        subject: client.emailSubject,
        text: client.emailBody,
        html: client.emailBody.replace(/\n/g, '<br>'), // Simple HTML conversion
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`   ✅ Email sent to ${client.email}`);

        return {
            success: true,
            messageId: info.messageId,
            response: info.response,
        };
    } catch (error) {
        console.error(`   ❌ Failed to send email to ${client.email}: ${error.message}`);

        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Sends emails to multiple clients with rate limiting
 * @param {Array} clients - Array of client objects with Appwrite document IDs
 * @returns {Promise<Object>} - Summary of sent emails
 */
export const sendEmailsToClients = async (clients) => {
    console.log(`\n📧 Sending emails via SMTP...\n`);

    const maxEmails = Math.min(clients.length, config.rateLimit.maxEmailsPerRun);
    const clientsToEmail = clients.slice(0, maxEmails);

    console.log(`   Sending to ${clientsToEmail.length} clients (max ${config.rateLimit.maxEmailsPerRun} per run)\n`);

    const results = {
        sent: 0,
        failed: 0,
        details: [],
    };

    for (let i = 0; i < clientsToEmail.length; i++) {
        const client = clientsToEmail[i];
        console.log(`   [${i + 1}/${clientsToEmail.length}] Sending to ${client.email}...`);

        const result = await sendEmail(client);

        // Update client record in Appwrite
        try {
            await updateClient(client.$id, {
                emailSent: result.success,
                emailSentDate: new Date().toISOString(),
                deliveryStatus: result.success ? 'sent' : 'failed',
                notes: result.success ? `Sent: ${result.messageId}` : `Error: ${result.error}`,
            });
        } catch (updateError) {
            console.error(`   ⚠️  Failed to update database for ${client.email}`);
        }

        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
        }

        results.details.push({
            email: client.email,
            success: result.success,
            error: result.error,
        });

        // Rate limiting between emails
        if (i < clientsToEmail.length - 1) {
            console.log(`   Waiting ${config.rateLimit.emailDelay}ms before next email...`);
            await new Promise(resolve => setTimeout(resolve, config.rateLimit.emailDelay));
        }
    }

    console.log(`\n✅ Email sending complete:`);
    console.log(`   Sent: ${results.sent}`);
    console.log(`   Failed: ${results.failed}\n`);

    return results;
};

/**
 * Verifies SMTP connection
 * @returns {Promise<boolean>} - True if connection successful
 */
export const verifySmtpConnection = async () => {
    const transporter = createTransporter();

    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        return true;
    } catch (error) {
        console.error(`❌ SMTP connection failed: ${error.message}`);
        return false;
    }
};
