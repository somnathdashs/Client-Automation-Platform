import { GoogleGenerativeAI } from '@google/generative-ai';
import config from './config.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Generates personalized email content using Gemini AI
 * @param {Object} client - Client information
 * @returns {Promise<Object>} - Generated email with subject and body
 */
export const generateEmail = async (client) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a professional web development service provider writing a personalized outreach email.

Client Information:
- Business Name: ${client.name || 'Business Owner'}
- Niche/Industry: ${client.niche}
- Platform: ${client.platform}
- Context: Found their contact on ${client.platform}
- Target Country: ${config.search.country || 'Global'}

Your Information:
- Name: ${config.business.name}
- Company: ${config.business.company}
- Website: ${config.business.website}
- Email: ${config.business.email}

Write a professional, polite, and attractive email that:
1. Has a compelling subject line (max 60 characters)
2. Addresses them professionally (use their business name if available)
3. Briefly mentions you found them on ${client.platform}
4. Highlights the value of having a professional website for their ${client.niche} business
5. Mentions 2-3 specific benefits (online presence, customer reach, credibility)
6. Naturally includes your website URL: ${config.business.website}
7. Has a clear but non-pushy call-to-action
8. Keeps the tone warm, professional, and respectful
9. Is concise (200-300 words max)
10. Signs off with your name and company

Format your response EXACTLY as:
SUBJECT: [subject line here]
BODY:
[email body here]

Do not include any other text or explanations.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the response
        const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
        const bodyMatch = text.match(/BODY:\s*([\s\S]+)/i);

        if (!subjectMatch || !bodyMatch) {
            throw new Error('Failed to parse Gemini response');
        }

        const emailContent = {
            subject: subjectMatch[1].trim(),
            body: bodyMatch[1].trim(),
        };

        console.log(`   ✅ Generated email for ${client.email}`);
        return emailContent;

    } catch (error) {
        console.error(`   ❌ Error generating email for ${client.email}: ${error.message}`);

        // Fallback template
        return {
            subject: `Professional Website Development for Your ${client.niche} Business`,
            body: `Hi,

I came across your profile on ${client.platform} and was impressed by your ${client.niche} business.

In today's digital age, having a professional website can significantly boost your online presence and help you reach more customers. I specialize in creating modern, responsive websites that help businesses like yours grow.

I'd love to discuss how a custom website could benefit your business. You can learn more about my services at ${config.business.website}.

Would you be interested in a quick chat about your online presence?

Best regards,
${config.business.name}
${config.business.company}
${config.business.website}`,
        };
    }
};

/**
 * Generates emails for multiple clients with rate limiting
 * @param {Array} clients - Array of client objects
 * @returns {Promise<Array>} - Clients with generated email content
 */
export const generateEmailsForClients = async (clients) => {
    console.log(`\n🤖 Generating personalized emails using Gemini AI...\n`);

    const enrichedClients = [];

    for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        console.log(`   [${i + 1}/${clients.length}] Generating email for ${client.email}...`);

        const emailContent = await generateEmail(client);

        enrichedClients.push({
            ...client,
            emailSubject: emailContent.subject,
            emailBody: emailContent.body,
        });

        // Small delay to avoid rate limiting
        if (i < clients.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`\n✅ Generated ${enrichedClients.length} personalized emails\n`);
    return enrichedClients;
};
