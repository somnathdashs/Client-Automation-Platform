# Client Automation Platform 🚀

> **Automated client outreach platform with AI-powered email generation and bulk management**

A powerful Node.js application that automates client discovery, email generation using Google's Gemini AI, and outreach management. Built for agencies, freelancers, and businesses looking to streamline their client acquisition process.

## ✨ Features

### 🔍 **Intelligent Client Discovery**
- Google search integration via SerpAPI
- Multi-platform scraping (Instagram, Facebook, LinkedIn, etc.)
- Email extraction and validation
- Niche and location-based targeting

### 🤖 **AI-Powered Email Generation**
- Google Gemini AI integration for personalized emails
- Customizable email templates with variable placeholders
- Context-aware content generation
- Bulk email regeneration

### 📧 **Email Management**
- SMTP integration for direct sending
- Bulk operations (send, generate, delete)
- Email status tracking
- Individual client management with modal editing

### 📊 **Advanced Client Management**
- Sortable client table (by date, email, niche)
- Multi-filter support (status, niche, platform)
- Bulk selection with checkboxes
- Real-time statistics dashboard

### ⚙️ **Flexible Configuration**
- Web-based settings interface
- Email template customization
- Rate limiting controls
- API key management

### 🎨 **Modern UI**
- Deep Space premium theme with glassmorphism
- Responsive design (mobile, tablet, desktop)
- Real-time Server-Sent Events (SSE) logging
- Progressive 4-step automation workflow

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- **SerpAPI Key** ([Get it here](https://serpapi.com/manage-api-key))
- **SMTP Credentials** (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "Automate email for webdev"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### 3. Configure settings
   
   The application uses a `settings.json` file for configuration. Copy the example file to get started:

   ```bash
   cp settings.example.json settings.json
   ```

   Then open `settings.json` and update it with your API keys and preferences:

   **settings.json**
   ```json
   {
     "gemini": {
       "apiKey": "YOUR_GEMINI_API_KEY"
     },
     "serpapi": {
       "apiKey": "YOUR_SERPAPI_KEY"
     },
     "smtp": {
       "host": "smtp.gmail.com",
       "port": 587,
       "secure": false,
       "user": "your_email@gmail.com",
       "pass": "your_app_password"
     },
     "business": {
       "name": "Your Name",
       "email": "your_email@gmail.com",
       "company": "Your Company",
       "website": "https://yourwebsite.com"
     },
     "emailTemplate": {
       "defaultSubject": "Let's grow your {business_type} together",
       "defaultBody": "Hi there,\n\nI came across your {business_type} on {platform}...",
       "generationPrompt": "Offering premium web development services..."
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

   > **Note:** You can also configure these settings directly via the **Settings Tab** in the web dashboard.

4. **Start the application**
   ```bash
   npm run web
   ```

5. **Access the platform**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📖 Usage Guide

### 1. **Configure Settings**
Navigate to the **Settings** tab and configure:
- API keys (Gemini, SerpAPI)
- SMTP credentials
- Business details
- Email templates
- Rate limiting preferences

### 2. **Run Automation Workflow**
Go to the **Automate** tab and follow the 4-step process:

**Step 1: Web Search**
- Enter niche (e.g., "restaurant")
- Specify country code (e.g., "us")
- Choose email domain (e.g., "gmail.com")
- List platforms (e.g., "instagram.com,facebook.com")

**Step 2: Generate Emails**
- AI generates personalized emails for found clients
- Uses Gemini AI with your custom templates

**Step 3: Confirm & Save**
- Review generated data
- Confirm before proceeding

**Step 4: Send Emails**
- Send emails to all clients via SMTP
- Real-time progress tracking

### 3. **Manage Clients**
In the **Clients** tab:
- View all discovered clients
- Filter by status, niche, or platform
- Sort by date, email, or niche
- Select multiple clients for bulk actions
- Edit individual emails via modal dialog
- Send, regenerate, or delete clients

### 4. **Monitor Progress**
Check the **Dashboard** for:
- Total clients discovered
- Emails sent count
- Pending emails

---

## 🔌 API Endpoints

### Client Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clients` | GET | Get all clients (with filters) |
| `/api/clients/:id` | GET | Get single client |
| `/api/clients/:id` | PUT | Update client |
| `/api/clients/:id` | DELETE | Delete client |
| `/api/clients/:id/send` | POST | Send email to client |
| `/api/clients/:id/regenerate` | POST | Regenerate email with AI |

### Automation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/automate/step1-search` | POST | Run web search |
| `/api/automate/step2-generate` | POST | Generate emails |
| `/api/automate/step3-confirm` | POST | Confirm data |
| `/api/automate/step4-send` | POST | Send all emails |
| `/api/automate/reset` | POST | Reset automation state |

### Configuration
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings` | GET | Get all settings |
| `/api/settings` | POST | Update settings |
| `/api/stats` | GET | Get dashboard statistics |

### Real-time
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET | Server-Sent Events stream |

---

## 📧 Email Template Variables

Use these variables in your email templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{user_name}` | Your name | John Doe |
| `{user_email}` | Your email | john@company.com |
| `{user_company}` | Your company | Web Solutions Inc |
| `{user_website}` | Your website | https://websolutions.com |
| `{client_email}` | Client's email | client@business.com |
| `{business_type}` | Client's business type | restaurant |
| `{niche}` | Same as business_type | restaurant |
| `{platform}` | Discovery platform | instagram.com |

**Example Template:**
```
Subject: Help {business_type} grow with modern web solutions

Hi there,

I discovered your {business_type} on {platform} and wanted to reach out!

I'm {user_name} from {user_company} ({user_website}), and we help businesses 
like yours succeed online with custom web solutions.

Interested in a quick chat?

Best,
{user_name}
```

---

## 🛠️ Project Structure

```
.
├── data/                   # Local database (JSON files)
├── public/                 # Frontend web app
│   ├── index.html         # Main HTML
│   ├── styles.css         # Styling
│   ├── script.js          # Client-side logic
│   └── logo.png           # Platform logo
├── src/                    # Backend source code
│   ├── server.js          # Express server & API
│   ├── dbClient.js        # Local database operations
│   ├── scraper.js         # SerpAPI integration
│   ├── emailExtractor.js  # Email extraction logic
│   └── geminiClient.js    # Gemini AI integration
├── settings.json          # Configuration file (gitignored)
├── settings.example.json  # Template for configuration
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
├── README.md              # This file
└── WIKI.md                # Detailed documentation
```

---

## 🔒 Security Best Practices

1. **Never commit `settings.json`** - Contains sensitive API keys (`settings.example.json` is safe)
2. **Use app passwords** for Gmail SMTP (not your actual password)
3. **Respect rate limits** - Configured in settings to avoid API bans
4. **Review emails before sending** - Always check generated content
5. **Keep dependencies updated** - Run `npm audit` regularly

---

## 🐛 Troubleshooting

### Common Issues

**"API key invalid"**
- Verify your Gemini/SerpAPI keys in Settings
- Check `settings.json` file has correct keys

**"SMTP authentication failed"**
- Use app-specific passwords for Gmail
- Verify SMTP host and port settings
- Check firewall isn't blocking port 587

**"No clients found"**
- Try different search terms
- Check SerpAPI quota hasn't been exceeded
- Verify platforms are accessible

**"Emails not generating"**
- Check Gemini API quota
- Verify custom prompt in settings
- Check console logs for detailed errors

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Email generation
- **SerpAPI** - Web scraping
- **Express.js** - Backend framework
- **Nodemailer** - Email sending

---

## 📞 Support

Need help? Contact the developer:
- **Website**: [sddev.in](https://sddev.in)
- **Buy Me a Coffee**: [Support the project](https://buymeacoffee.com/somnathdash)

---

## 🗺️ Roadmap

- [ ] Export clients to CSV
- [ ] Email open/click tracking
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Schedule email sending
- [ ] A/B testing for email templates

---

**Built with ❤️ for automating client outreach**
