# Client Automation Platform - Wiki 📚

Comprehensive guide and documentation for the Client Automation Platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration Guide](#configuration-guide)
3. [Feature Deep Dive](#feature-deep-dive)
4. [API Reference](#api-reference)
5. [Best Practices](#best-practices)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Getting Started

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **RAM**: Minimum 2GB recommended
- **Disk Space**: 500MB for application and data

### First Time Setup

#### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

Verify installation:
```bash
node --version
npm --version
```

#### 2. Clone and Install
```bash
git clone <repository-url>
cd "Automate email for webdev"
npm install
```

#### 3. Get API Keys

**Gemini AI API:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Get API Key"
4. Copy the key

**SerpAPI:**
1. Visit [SerpAPI](https://serpapi.com/)
2. Create an account
3. Go to "Manage API Key"
4. Copy your API key

**Gmail SMTP (Recommended):**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Select "Mail" and your device
   - Copy the 16-character password

#### 4. Configure settings.json
The application uses `settings.json` for configuration. Copy `settings.example.json` to `settings.json` and edit it:

```json
{
  "gemini": { "apiKey": "YOUR_KEY" },
  "serpapi": { "apiKey": "YOUR_KEY" },
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "email@gmail.com",
    "pass": "app_password"
  },
  "business": {
    "name": "Your Name",
    "email": "email@gmail.com",
    "company": "Company",
    "website": "https://site.com"
  },
  "emailTemplate": {
    "defaultSubject": "Subject",
    "defaultBody": "Body",
    "generationPrompt": "Prompt"
  },
  "search": {
    "maxSearchesPerRun": 30,
    "resultsPerPage": 10,
    "maxPagesPerSearch": 5
  },
  "rateLimit": {
    "searchDelay": 2000,
    "emailDelay": 5000,
    "maxEmailsPerRun": 10
  }
}
```

#### 5. Launch the Platform
```bash
npm run web
```

Open browser to: `http://localhost:3000`

---

## Configuration Guide

### Email Template Variables

All available variables you can use in email subject and body:

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{user_name}` | Your name from settings | John Smith |
| `{user_email}` | Your email from settings | john@webagency.com |
| `{user_company}` | Your company name | Web Agency Pro |
| `{user_website}` | Your website URL | https://webagency.com |
| `{client_email}` | Client's discovered email | restaurant@example.com |
| `{business_type}` | Client's business type/niche | restaurant |
| `{niche}` | Alias for business_type | restaurant |
| `{platform}` | Where client was found | instagram.com |

### Email Template Examples

**Professional & Direct:**
```
Subject: Quick question about {business_type} marketing

Hi,

I came across your {business_type} on {platform}. Your content caught my attention!

I'm {user_name} from {user_company}. We help businesses like yours increase their online visibility and customer engagement.

Would you have 10 minutes this week for a quick call?

Best,
{user_name}
{user_email}
```

**Value-Focused:**
```
Subject: 3 ways to grow {business_type} online

Hi there!

As a {business_type} owner, you know how competitive it is to stand out online.

I'm {user_name} from {user_company}, and we've helped similar businesses:
• Increase website traffic by 200%
• Generate 3x more leads
• Build stronger brand presence

Interested in learning how? Let's chat!

{user_name}
{user_website}
```

**Casual & Friendly:**
```
Subject: Loved your {business_type}! 😊

Hey!

Just stumbled upon your {business_type} on {platform} - looks amazing!

I'm {user_name}, and I help businesses like yours create killer websites that actually convert visitors into customers.

Would love to share some ideas that might help you grow. Got 15 mins?

Cheers,
{user_name}
{user_company}
```

### SMTP Providers

**Gmail (Recommended for beginners):**
In `settings.json`:
```json
"smtp": {
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "your.email@gmail.com",
  "pass": "app_password_16_chars"
}
```

**Outlook/Hotmail:**
```json
"smtp": {
  "host": "smtp-mail.outlook.com",
  "port": 587,
  "secure": false,
  "user": "your.email@outlook.com",
  "pass": "your_password"
}
```

**SendGrid (High Volume):**
```json
"smtp": {
  "host": "smtp.sendgrid.net",
  "port": 587,
  "secure": false,
  "user": "apikey",
  "pass": "your_sendgrid_api_key"
}
```

**Mailgun:**
```json
"smtp": {
  "host": "smtp.mailgun.org",
  "port": 587,
  "secure": false,
  "user": "postmaster@your-domain.mailgun.org",
  "pass": "your_mailgun_smtp_password"
}
```

---

## Feature Deep Dive

### 1. Web Search (Step 1)

**How it works:**
- Uses SerpAPI to search Google with specific queries
- Searches across multiple platforms simultaneously
- Extracts email addresses from search results
- Filters by email provider (e.g., only Gmail addresses)

**Best Practices:**
- Use specific niches: "italian restaurant" > "restaurant"
- Target one country at a time for better results
- Popular email domains: gmail.com, yahoo.com, outlook.com
- Test with 1-2 platforms first before scaling

**Example Searches:**
```
Niche: coffee shop
Country: us
Email Domain: gmail.com
Platforms: instagram.com, facebook.com

This searches: "site:instagram.com coffee shop us @gmail.com"
```

### 2. Email Generation (Step 2)

**How it works:**
- Uses Google Gemini AI Pro model
- Generates unique emails for each client
- Incorporates your custom prompt and template
- Uses client context (niche, platform, email)

**Optimization Tips:**
- Set clear EMAIL_GENERATION_PROMPT
- Use specific templates with variables
- Review first few generated emails
- Adjust prompt if output isn't satisfactory

### 3. Bulk Operations

**Selection:**
- Click checkboxes to select individual clients
- Use "Select All" to select all visible clients
- Selection persists through filtering

**Actions:**
- **Generate Emails**: Regenerate for selected clients
- **Send Emails**: Send immediately to selected (500ms delay between)
- **Delete**: Permanently remove from database

**Safety:**
- All bulk actions require confirmation
- Shows success/failure counts
- Automatic refresh after completion

### 4. Filtering & Sorting

**Filter Options:**
- **Status**: All / Sent / Unsent
- **Niche**: Dynamically populated from data
- **Platform**: Dynamically populated from data

**Sort Options:**
- Date (Newest first / Oldest first)
- Email (A-Z / Z-A)
- Niche (A-Z)

**Pro Tip:** Combine filters for laser-focused targeting
- Example: "Unsent" + "restaurant" + "instagram.com"

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication
No authentication required for local development.

### Endpoints

#### GET /api/stats
Returns dashboard statistics.

**Response:**
```json
{
  "totalClients": 45,
  "emailsSent": 12,
  "unsentEmails": 33
}
```

#### GET /api/clients
Get all clients with optional filters.

**Query Parameters:**
- `status`: "sent" | "unsent"
- `niche`: string

**Example:**
```
GET /api/clients?status=unsent&niche=restaurant
```

**Response:**
```json
[
  {
    "$id": "unique-id",
    "email": "contact@restaurant.com",
    "niche": "restaurant",
    "platform": "instagram.com",
    "emailSent": false,
    "emailSubject": "...",
    "emailBody": "...",
    "foundDate": "2024-01-01T12:00:00Z"
  }
]
```

#### PUT /api/clients/:id
Update client information.

**Body:**
```json
{
  "emailSubject": "Updated subject",
  "emailBody": "Updated body..."
}
```

#### POST /api/clients/:id/send
Send email to specific client.

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

#### POST /api/clients/:id/regenerate
Regenerate email using Gemini AI.

**Response:**
```json
{
  "success": true,
  "client": {
    "emailSubject": "New subject",
    "emailBody": "New body..."
  }
}
```

#### DELETE /api/clients/:id
Delete client from database.

#### POST /api/automate/step1-search
Run web search for clients.

**Body:**
```json
{
  "niche": "coffee shop",
  "country": "us",
  "emailProvider": "gmail.com",
  "platforms": "instagram.com,facebook.com"
}
```

#### POST /api/automate/step2-generate
Generate emails for all unemailed clients.

#### POST /api/automate/step4-send
Send emails to all unemailed clients.

#### GET /api/events
Server-Sent Events stream for real-time logs.

**Event Types:**
- `log`: Log messages
- `state`: Automation state updates

---

## Best Practices

### Email Deliverability

1. **Warm Up Your Email**
   - Start with 5-10 emails per day
   - Gradually increase over 2-3 weeks
   - Use consistent sending schedule

2. **Content Quality**
   - Personalize with variables
   - Avoid spam trigger words
   - Keep emails under 200 words
   - Include clear unsubscribe option

3. **Technical Setup**
   - Set up SPF, DKIM, DMARC records
   - Use professional email domain
   - Monitor bounce rates
   - Check spam score before sending

### Rate Limiting

**Recommended Settings (in `settings.json`):**
```json
"rateLimit": {
  "searchDelay": 2000,
  "emailDelay": 5000,
  "maxEmailsPerRun": 10,
  "maxSearchesPerRun": 30
}
```

**Why Rate Limit?**
- Avoid IP bans from search engines
- Stay within API quotas
- Appear more human-like
- Better email deliverability

### Data Management

1. **Regular Backups**
   ```bash
   # Manual backup
   cp data/clients.json data/backup-$(date +%Y%m%d).json
   ```

2. **Clean Old Data**
   - Archive sent clients monthly
   - Remove bounced emails
   - Update client statuses

3. **Export Before Major Changes**
   - Before bulk delete operations
   - Before updating templates
   - Before platform updates

---

## Advanced Usage

### Custom Email Logic

Edit `src/geminiClient.js` to customize AI behavior:

```javascript
const customPrompt = `
Generate a professional outreach email for a ${client.niche} business.

Context:
- Found on: ${client.platform}
- Target: ${client.email}
- Your offer: ${yourOffer}

Requirements:
- Maximum 150 words
- Include specific value proposition
- End with clear call-to-action
- Friendly but professional tone
`;
```

### Webhook Integration

Add webhook notifications in `src/server.js`:

```javascript
async function sendWebhook(event, data) {
  await fetch('https://your-webhook-url.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, data, timestamp: new Date() })
  });
}

// Call after important events
await sendWebhook('email_sent', { clientId, success: true });
```

### Scheduled Automation

Use cron jobs for scheduled execution:

**Linux/Mac (crontab):**
```bash
# Run every day at 9 AM
0 9 * * * cd /path/to/project && npm run cli
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily at 9 AM)
4. Action: Start a program
5. Program: `node`
6. Arguments: `src/server.js`

---

## Troubleshooting

### Common Errors

**Error: "Invalid API Key"**
```
Solution:
1. Check settings.json exists
2. Verify keys in "Settings" tab
3. Test key at makersuite.google.com
```

**Error: "530 5.7.0 Authentication Required"**
```
Solution (Gmail):
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use 16-character app password
4. Update SMTP Password in Settings
```

**Error: "No clients found"**
```
Solutions:
1. Try broader search terms
2. Check SerpAPI quota (100 free/month)
3. Try different platforms
4. Verify internet connection
5. Check if platform allows scraping
```

**Error: "Port 3000 already in use"**
```
Solution:
1. Change port in server.js:
   const PORT = process.env.PORT || 3001;
2. Or kill existing process:
   Windows: netstat -ano | findstr :3000
   Linux/Mac: lsof -ti :3000 | xargs kill
```

### Performance Issues

**Slow Email Generation:**
- Reduce MAX_EMAILS_PER_RUN
- Simplify EMAIL_GENERATION_PROMPT
- Check Gemini API status
- Increase EMAIL_DELAY

**High Memory Usage:**
- Clear old logs regularly
- Limit MAX_SEARCHES_PER_RUN
- Restart server periodically
- Check for memory leaks in custom code

---

## FAQ

**Q: Can I use this commercially?**
A: Yes! The platform is MIT licensed. Ensure you comply with:
- SerpAPI terms of service
- Google Gemini AI terms
- Email anti-spam laws (CAN-SPAM, GDPR)

**Q: How many emails can I send per day?**
A: Depends on your SMTP provider:
- Gmail: ~500/day (new accounts), ~2000/day (established)
- SendGrid: Based on your plan
- Mailgun: Based on your plan

**Q: Can I add more platforms to search?**
A: Yes! Add any website to the platforms field:
`linkedin.com,twitter.com,reddit.com,etc`

**Q: Is the data stored securely?**
A: Data is stored locally in JSON files (`data/clients.json`). For production:
- Use encrypted database
- Implement authentication
- Add HTTPS
- Regular backups

**Q: Can I export the client list?**
A: Yes! The data is in `data/clients.json`. You can:
- Copy the file directly
- Parse and export to CSV
- Implement custom export feature

**Q: How to handle unsubscribe requests?**
A: Current version doesn't include unsubscribe handling. Recommended:
1. Add manually to blacklist
2. Remove from database
3. Implement unsubscribe endpoint (future feature)

**Q: Can I run multiple instances?**
A: Yes, but:
- Use different ports
- Separate `settings.json` files
- Separate data directories
- Monitor API quotas

---

## Support & Resources

- **Documentation**: This wiki
- **Issues**: GitHub Issues (if public repo)
- **Updates**: Check README for roadmap
- **Community**: Coming soon

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0
**Platform**: Client Automation Platform
