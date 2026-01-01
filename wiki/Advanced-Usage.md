# Advanced Usage

## Custom Email Logic

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

## Webhook Integration

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

## Scheduled Automation

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
