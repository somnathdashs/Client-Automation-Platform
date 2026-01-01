# User Guide

This guide will help you get started with the Client Automation Platform.

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Creating Desktop Shortcut](#creating-desktop-shortcut)
3. [First Time Setup](#first-time-setup)
4. [Basic Usage](#basic-usage)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Installation

### Prerequisites
- **Node.js**: v14.0.0 or higher ([Download here](https://nodejs.org/))
- **Git**: ([Download here](https://git-scm.com/))

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/somnathdashs/Client-Automation-Platform.git
   ```

2. **Navigate to Project Folder**
   ```bash
   cd Client-Automation-Platform
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   This will download all required packages (may take a few minutes).

---

## 🖥️ Creating Desktop Shortcut

To make launching the application easy (like a regular app), follow these steps:

1. **Locate the Batch File**
   - Open the project folder `Client-Automation-Platform` in File Explorer.
   - Find the file named `start_app.bat` (or just `start_app`).

2. **Create Shortcut**
   - **Right-click** on `start_app.bat`.
   - Select **Send to** from the menu.
   - Click **Desktop (create shortcut)**.

3. **Launch!**
   - Go to your Desktop.
   - Double-click the new shortcut.
   - A terminal window will open (keep this open!) and the application will automatically launch in your default web browser.

---

## ⚙️ First Time Setup

### Step 1: Launch the Application
- Double-click your new desktop shortcut (or run `npm run web` in terminal).
- Wait for browser to open at `http://localhost:3000`.

### Step 2: Navigate to Settings
Click on the **⚙️ Settings** tab in the navigation menu.

### Step 3: Enter API Keys

#### Get Gemini AI API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Copy and paste into the **Gemini API Key** field

#### Get SerpAPI Key:
1. Visit [SerpAPI](https://serpapi.com/)
2. Sign up for a free account (100 searches/month free)
3. Go to **"Dashboard"** → **"API Key"**
4. Copy and paste into the **SerpAPI Key** field

### Step 4: Configure Email Settings

#### For Gmail Users (Recommended):
1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification
2. **Generate App Password**:
   - Security → 2-Step Verification → App Passwords
   - Select **Mail** and your device
   - Copy the 16-character password
3. **Enter in Settings**:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - Email: Your Gmail address
   - Password: The app password you just generated

### Step 5: Enter Business Information
Fill in your details such as Name, Email, Company, and Website.

### Step 6: Save Settings
Click **💾 Save Settings** button at the bottom.

✅ You're all set!

---

## 📖 Basic Usage

### 1. Dashboard Overview
The **Dashboard** shows your total clients, emails sent, and success rate.

### 2. Running Automation
1. Click on **🤖 Automate** tab.
2. Enter search queries (e.g., "restaurants in New York").
3. Click **Start Automation**.
4. Watch the progress in real-time as the app searches, generates emails, and sends them.

### 3. Managing Clients
- Visit the **👥 Clients** tab to view, filter, and manage discovered clients.
- You can manually send emails or regenerate content here.

---

## 🔧 Troubleshooting

### Application Won't Start
- **Port In Use**: Ensure no other application is using port 3000.
- **Node.js**: Verify installation with `node --version`.
- **Dependencies**: Try deleting the `node_modules` folder and running `npm install` again.

### Browser Doesn't Open Automatically
- Manually open `http://localhost:3000` in your browser.

### Emails Not Sending
- Verify your SMTP settings and App Password.
- Check your internet connection.

---

**Happy Automating! 🚀**
