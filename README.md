# Client Automation Platform 🚀

> **Automated client outreach platform with AI-powered email generation and bulk management**

A powerful Node.js application that automates client discovery, email generation using Google's Gemini AI, and outreach management. Built for agencies, freelancers, and businesses looking to streamline their client acquisition process.

## ✨ Features

- **🔍 Intelligent Client Discovery**: Google search integration via SerpAPI with multi-platform scraping.
- **🤖 AI-Powered Email Generation**: Personalized emails using Google Gemini AI context-aware templates.
- **📧 Email Management**: SMTP integration, bulk operations, and status tracking.
- **📊 Advanced Management**: Sortable client tables, filters, and real-time dashboard stats.
- **⚙️ Flexible Configuration**: Web-based settings and customizable API management.
- **🎨 Modern UI**: Premium "Deep Space" theme with glassmorphism and real-time updates.

[**Explore full features in the Wiki »**](wiki/Features.md)

---

## � Documentation

Detailed documentation is available in the `wiki/` directory:

- [**Getting Started**](wiki/Getting-Started.md) - Installation and setup
- [**Configuration**](wiki/Configuration.md) - customizable settings & templates
- [**Deployment Guide**](wiki/Deployment.md) - Docker & Cloud hosting
- [**API Reference**](wiki/API-Reference.md) - Endpoints documentation
- [**Best Practices**](wiki/Best-Practices.md) - Email deliverability tips
- [**Troubleshooting**](wiki/Troubleshooting.md) - Common fixes

---

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Settings**
   Open `settings.json` and update it with your API keys:
   ```bash
   # Edit settings.json directly
   ```

4. **Start the application**
   ```bash
   npm run web
   ```
   Access the dashboard at `http://localhost:3000`.

---

## 🚢 Deployment

See [**Deployment Guide**](wiki/Deployment.md) for more details.

---

## 🛠️ Project Structure

```
.
├── data/                   # Local database (JSON files)
├── public/                 # Frontend web app
├── src/                    # Backend source code
├── settings.json          # Configuration file (gitignored)
├── wiki/                  # Detailed documentation
└── ...
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini AI**
- **SerpAPI**
- **Express.js** & **Nodemailer**

---

## 📞 Support

- **Website**: [Somnath Dash](https://somnathdashs.github.io)
- **Buy Me a Coffee**: [Support the project](https://buymeacoffee.com/somnathdash)
