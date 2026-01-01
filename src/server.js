import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// dotenv import removed
import { searchAllNiches } from './scraper.js';
import { processSearchResults } from './emailExtractor.js';
import { generateEmailsForClients } from './geminiClient.js';
import { saveClients, getUnemailedClients, getAllClients, updateClient, getClientByEmail, deleteClient } from './dbClient.js';
import { sendEmailsToClients, verifySmtpConnection, sendEmail } from './emailSender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv removed

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/wiki', express.static(path.join(__dirname, '../wiki')));

// Global Automation State
let automationState = {
    status: 'idle', // idle, running, completed, error
    currentStep: 0,
    logs: [],
    searchResults: [],
    extractedClients: [],
    generatedClients: [],
    stats: {
        found: 0,
        generated: 0,
        saved: 0,
        sent: 0
    }
};

let sseClients = [];

// SSE Helper
const sendEvent = (type, data) => {
    sseClients.forEach(client => {
        client.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    });
};

const broadcastState = () => {
    sendEvent('state', {
        status: automationState.status,
        currentStep: automationState.currentStep,
        stats: automationState.stats
    });
};

// Capture logs and send via SSE
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    originalLog(msg);
    const logEntry = { time: new Date().toLocaleTimeString(), message: msg, type: 'info' };
    automationState.logs.push(logEntry);
    if (automationState.logs.length > 500) automationState.logs.shift();
    sendEvent('log', logEntry);
};

console.error = (...args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    originalError(msg);
    const logEntry = { time: new Date().toLocaleTimeString(), message: msg, type: 'error' };
    automationState.logs.push(logEntry);
    sendEvent('log', logEntry);
};

// --- API Routes ---

// SSE Endpoint
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    sseClients.push(res);

    // Send initial state and logs
    res.write(`data: ${JSON.stringify({ type: 'state', data: automationState })}\n\n`);
    automationState.logs.slice(-50).forEach(log => {
        res.write(`data: ${JSON.stringify({ type: 'log', data: log })}\n\n`);
    });

    req.on('close', () => {
        sseClients = sseClients.filter(c => c !== res);
    });
});

// Step 1: Run Web Search
app.post('/api/automate/step1-search', async (req, res) => {
    const { niche, country, emailProvider, platforms } = req.body;

    if (automationState.status === 'running') {
        return res.status(400).json({ error: 'Automation is already running' });
    }

    automationState.status = 'running';
    automationState.currentStep = 1;
    automationState.logs = [];
    automationState.searchResults = [];
    automationState.extractedClients = [];
    automationState.stats = { found: 0, generated: 0, saved: 0, sent: 0 };
    broadcastState();

    try {
        console.log(`Starting Step 1: Web Search for "${niche}" in "${country}"...`);

        const searchParams = { niche, country, emailProvider, platforms };
        const results = await searchAllNiches(searchParams);
        automationState.searchResults = results;

        console.log(`Step 1 complete. Found ${results.length} raw results. Extracting emails...`);

        const clients = processSearchResults(results);
        automationState.extractedClients = clients;
        automationState.stats.found = clients.length;

        // Save to DB immediately as requested
        await saveClients(clients);
        console.log(`Extracted and saved ${clients.length} unique potential clients.`);

        automationState.status = 'idle'; // Wait for user to trigger next step
        broadcastState();
        res.json({ success: true, count: clients.length });
    } catch (error) {
        console.error('Error in Step 1:', error);
        automationState.status = 'error';
        broadcastState();
        res.status(500).json({ error: error.message });
    }
});

// Step 2: Generate Emails
app.post('/api/automate/step2-generate', async (req, res) => {
    if (automationState.extractedClients.length === 0) {
        return res.status(400).json({ error: 'No clients found in Step 1' });
    }

    automationState.status = 'running';
    automationState.currentStep = 2;
    broadcastState();

    try {
        console.log(`Starting Step 2: Generating emails for ${automationState.extractedClients.length} clients...`);

        const enriched = await generateEmailsForClients(automationState.extractedClients);
        automationState.generatedClients = enriched;
        automationState.stats.generated = enriched.length;

        // Save generated content to DB
        await saveClients(enriched);
        console.log(`Step 2 complete. Generated ${enriched.length} personalized emails.`);

        automationState.status = 'idle';
        broadcastState();
        res.json({ success: true, count: enriched.length });
    } catch (error) {
        console.error('Error in Step 2:', error);
        automationState.status = 'error';
        broadcastState();
        res.status(500).json({ error: error.message });
    }
});

// Step 3: Confirm Save (basically transitions to the final step)
app.post('/api/automate/step3-confirm', async (req, res) => {
    automationState.currentStep = 3;
    console.log('Step 3: All data confirmed and saved to local storage.');
    automationState.stats.saved = automationState.stats.generated;
    broadcastState();
    res.json({ success: true });
});

// Step 4: Send Emails
app.post('/api/automate/step4-send', async (req, res) => {
    if (automationState.generatedClients.length === 0) {
        return res.status(400).json({ error: 'No generated emails to send' });
    }

    automationState.status = 'running';
    automationState.currentStep = 4;
    broadcastState();

    try {
        console.log(`Starting Step 4: Sending ${automationState.generatedClients.length} emails...`);

        const results = await sendEmailsToClients(automationState.generatedClients);
        automationState.stats.sent = results.sent;

        console.log(`Step 4 complete. Sent: ${results.sent}, Failed: ${results.failed}`);

        automationState.status = 'completed';
        broadcastState();
        res.json({ success: true, sent: results.sent, failed: results.failed });
    } catch (error) {
        console.error('Error in Step 4:', error);
        automationState.status = 'error';
        broadcastState();
        res.status(500).json({ error: error.message });
    }
});

// Client Management Routes
app.get('/api/clients', async (req, res) => {
    try {
        const { status, niche } = req.query;
        let clients = await getAllClients();

        if (status === 'sent') clients = clients.filter(c => c.emailSent);
        else if (status === 'unsent') clients = clients.filter(c => !c.emailSent);

        if (niche && niche !== 'all') {
            clients = clients.filter(c => c.niche && c.niche.toLowerCase().includes(niche.toLowerCase()));
        }

        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/clients/:id', async (req, res) => {
    try {
        const updated = await updateClient(req.params.id, req.body);
        res.json({ success: true, client: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        await deleteClient(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clients/:id/regenerate', async (req, res) => {
    try {
        const clients = await getAllClients();
        const client = clients.find(c => c.$id === req.params.id);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        const enriched = await generateEmailsForClients([client]);
        const updated = await updateClient(client.$id, {
            emailSubject: enriched[0].emailSubject,
            emailBody: enriched[0].emailBody
        });

        res.json({ success: true, client: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/clients/:id/send', async (req, res) => {
    try {
        const clients = await getAllClients();
        const client = clients.find(c => c.$id === req.params.id);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        const smtpValid = await verifySmtpConnection();
        if (!smtpValid) return res.status(400).json({ error: 'SMTP connection failed' });

        const result = await sendEmail(client);
        await updateClient(client.$id, {
            emailSent: result.success,
            emailSentDate: new Date().toISOString(),
            deliveryStatus: result.success ? 'sent' : 'failed'
        });

        res.json({ success: result.success, error: result.error });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Settings management (JSON)
const SETTINGS_PATH = path.join(__dirname, '../settings.json');

app.get('/api/settings', (req, res) => {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) {
            return res.json({});
        }
        const settingsContent = fs.readFileSync(SETTINGS_PATH, 'utf-8');
        const settings = JSON.parse(settingsContent);

        // Flatten for frontend compatibility if needed, but better to send structured JSON
        // The frontend expects flat list of keys currently? Let's check.
        // The frontend code (script.js) likely iterates over keys to fill inputs. 
        // We might need to flatten it OR update frontend. 
        // User asked to "use A json with defult values for setting". 
        // Let's send the structured JSON and we might need to update frontend to handle nested objects
        // OR flatten it here for backward compatibility with the UI form.

        // Let's flatten it for now to match exactly what the frontend form expects (e.g. GEMINI_API_KEY)
        // Wait, the frontend form IDs matched the .env keys (e.g. id="GEMINI_API_KEY").
        // We should map the structured settings back to those keys for the UI to populate correctly.

        const flatSettings = {
            GEMINI_API_KEY: settings.gemini?.apiKey || '',
            SERPAPI_KEY: settings.serpapi?.apiKey || '',
            SMTP_HOST: settings.smtp?.host || '',
            SMTP_PORT: settings.smtp?.port || '',
            SMTP_SECURE: settings.smtp?.secure?.toString() || 'false',
            SMTP_USER: settings.smtp?.user || '',
            SMTP_PASS: settings.smtp?.pass || '',
            YOUR_NAME: settings.business?.name || '',
            YOUR_EMAIL: settings.business?.email || '',
            YOUR_COMPANY: settings.business?.company || '',
            YOUR_WEBSITE: settings.business?.website || '',
            DEFAULT_EMAIL_SUBJECT: settings.emailTemplate?.defaultSubject || '',
            DEFAULT_EMAIL_BODY: settings.emailTemplate?.defaultBody || '',
            EMAIL_GENERATION_PROMPT: settings.emailTemplate?.generationPrompt || '',
            MAX_SEARCHES_PER_RUN: settings.search?.maxSearchesPerRun || '',
            RESULTS_PER_PAGE: settings.search?.resultsPerPage || '',
            MAX_PAGES_PER_SEARCH: settings.search?.maxPagesPerSearch || '',
            SEARCH_DELAY: settings.rateLimit?.searchDelay || '',
            EMAIL_DELAY: settings.rateLimit?.emailDelay || '',
            MAX_EMAILS_PER_RUN: settings.rateLimit?.maxEmailsPerRun || ''
        };

        res.json(flatSettings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const flatSettings = req.body;

        // Read existing to preserve other fields if any
        let currentSettings = {};
        if (fs.existsSync(SETTINGS_PATH)) {
            currentSettings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
        }

        // Update structured settings from flat keys
        const newSettings = {
            gemini: { ...currentSettings.gemini, apiKey: flatSettings.GEMINI_API_KEY },
            serpapi: { ...currentSettings.serpapi, apiKey: flatSettings.SERPAPI_KEY },
            smtp: {
                ...currentSettings.smtp,
                host: flatSettings.SMTP_HOST,
                port: parseInt(flatSettings.SMTP_PORT),
                secure: flatSettings.SMTP_SECURE === 'true' || flatSettings.SMTP_SECURE === true,
                user: flatSettings.SMTP_USER,
                pass: flatSettings.SMTP_PASS
            },
            business: {
                ...currentSettings.business,
                name: flatSettings.YOUR_NAME,
                email: flatSettings.YOUR_EMAIL,
                company: flatSettings.YOUR_COMPANY,
                website: flatSettings.YOUR_WEBSITE
            },
            emailTemplate: {
                ...currentSettings.emailTemplate,
                defaultSubject: flatSettings.DEFAULT_EMAIL_SUBJECT,
                defaultBody: flatSettings.DEFAULT_EMAIL_BODY,
                generationPrompt: flatSettings.EMAIL_GENERATION_PROMPT
            },
            search: {
                ...currentSettings.search,
                maxSearchesPerRun: parseInt(flatSettings.MAX_SEARCHES_PER_RUN),
                resultsPerPage: parseInt(flatSettings.RESULTS_PER_PAGE),
                maxPagesPerSearch: parseInt(flatSettings.MAX_PAGES_PER_SEARCH)
            },
            rateLimit: {
                ...currentSettings.rateLimit,
                searchDelay: parseInt(flatSettings.SEARCH_DELAY),
                emailDelay: parseInt(flatSettings.EMAIL_DELAY),
                maxEmailsPerRun: parseInt(flatSettings.MAX_EMAILS_PER_RUN)
            }
        };

        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2));

        // We don't need to reload dotenv anymore.
        // Config module reads from file on demand or we can rely on restart 
        // (but config.js reads once at startup? No, let's check config.js again. 
        // It reads at top level. We might need a way to reload it or restart server. 
        // The user usually restarts or we can make config.js export a reload function.)
        // For now, let's just save. The updated config.js I wrote earlier reads on load. 
        // So changes apply on restart. That's acceptable for now or I can improve it.

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stats for dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const all = await getAllClients();
        const sent = all.filter(c => c.emailSent).length;
        res.json({
            totalClients: all.length,
            emailsSent: sent,
            unsentEmails: all.length - sent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Reset
app.post('/api/automate/reset', (req, res) => {
    automationState = {
        status: 'idle',
        currentStep: 0,
        logs: [],
        searchResults: [],
        extractedClients: [],
        generatedClients: [],
        stats: { found: 0, generated: 0, saved: 0, sent: 0 }
    };
    broadcastState();
    res.json({ success: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    originalLog(`\n🚀 Web Dashboard running at http://localhost:${PORT}\n`);
});

export default app;

