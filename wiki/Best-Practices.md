# Best Practices

## Email Deliverability

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

## Rate Limiting

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

## Data Management

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
