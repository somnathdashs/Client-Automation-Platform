# FAQ

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
