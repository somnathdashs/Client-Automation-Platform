# Getting Started

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **RAM**: Minimum 2GB recommended
- **Disk Space**: 500MB for application and data

## First Time Setup

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

Verify installation:
```bash
node --version
npm --version
```

### 2. Clone and Install
```bash
git clone <repository-url>
cd "Automate email for webdev"
npm install
```

### 3. Get API Keys

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

### 4. Configure settings.json
The application uses `settings.json` for configuration. Edit it directly:

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

### 5. Launch the Platform
```bash
npm run web
```

Open browser to: `http://localhost:3000`
