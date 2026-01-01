# Configuration Guide

## Email Template Variables

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

## Email Template Examples

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

## SMTP Providers

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
