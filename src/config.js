import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_PATH = path.join(__dirname, '../settings.json');

// Helper to read settings
const readSettings = () => {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      console.warn('⚠️ settings.json not found, using empty config.');
      return {};
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading settings.json:', error);
    return {};
  }
};

const settings = readSettings();

const config = {
  // Gemini API
  gemini: {
    apiKey: settings.gemini?.apiKey || '',
  },

  // SerpAPI
  serpapi: {
    apiKey: settings.serpapi?.apiKey || '',
  },

  // SMTP
  smtp: {
    host: settings.smtp?.host || 'smtp.gmail.com',
    port: parseInt(settings.smtp?.port) || 587,
    secure: settings.smtp?.secure === true,
    user: settings.smtp?.user || '',
    pass: settings.smtp?.pass || '',
  },

  // Business Details
  business: {
    name: settings.business?.name || '',
    email: settings.business?.email || '',
    website: settings.business?.website || '',
    company: settings.business?.company || '',
  },

  // Search Configuration
  search: {
    // These are no longer in settings.json as lists, but we keep the structure if needed for code compatibility
    // or we defaults if the new settings structure completely removed them.
    // The user moved away from specific niche/domain lists in settings to inputs, 
    // but the backend might still rely on defaults.
    // Let's use defaults if not present, but mainly we look at the new simple settings.
    maxSearchesPerRun: parseInt(settings.search?.maxSearchesPerRun) || 30,
    resultsPerPage: parseInt(settings.search?.resultsPerPage) || 10,
    maxPagesPerSearch: parseInt(settings.search?.maxPagesPerSearch) || 5,
    emailDomains: ['@gmail.com', '@hotmail.com', '@yahoo.com'], // Hardcoded defaults if not in settings
    socialPlatforms: ['instagram.com', 'facebook.com', 'linkedin.com'], // Hardcoded defaults
  },

  // Rate Limiting
  rateLimit: {
    searchDelay: parseInt(settings.rateLimit?.searchDelay) || 2000,
    emailDelay: parseInt(settings.rateLimit?.emailDelay) || 5000,
    maxEmailsPerRun: parseInt(settings.rateLimit?.maxEmailsPerRun) || 10,
  },

  // Email Template (New)
  emailTemplate: {
    defaultSubject: settings.emailTemplate?.defaultSubject || '',
    defaultBody: settings.emailTemplate?.defaultBody || '',
    generationPrompt: settings.emailTemplate?.generationPrompt || ''
  }
};

// Validate required fields
export const validateConfig = () => {
  // refresh settings to check current state
  const currentSettings = readSettings();

  const required = [
    { key: 'Gemini API Key', value: currentSettings.gemini?.apiKey },
    { key: 'SerpAPI Key', value: currentSettings.serpapi?.apiKey },
    { key: 'SMTP User', value: currentSettings.smtp?.user },
    { key: 'SMTP Password', value: currentSettings.smtp?.pass },
  ];

  const missing = required.filter(r => !r.value);

  if (missing.length > 0) {
    console.error('❌ Missing required configuration in settings.json:');
    missing.forEach(m => console.error(`   - ${m.key}`));
    return false;
  }
  return true;
};

// Export raw settings reader for other modules if they need direct access to reload
export { readSettings, SETTINGS_PATH };

export default config;
