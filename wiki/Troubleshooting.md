# Troubleshooting

## Common Errors

**Error: "Invalid API Key"**
```
Solution:
1. Check settings.json exists
2. Verify keys in "Settings" tab
3. Test key at makersuite.google.com
```

**Error: "530 5.7.0 Authentication Required"**
```
Solution (Gmail):
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use 16-character app password
4. Update SMTP Password in Settings
```

**Error: "No clients found"**
```
Solutions:
1. Try broader search terms
2. Check SerpAPI quota (100 free/month)
3. Try different platforms
4. Verify internet connection
5. Check if platform allows scraping
```

**Error: "Port 3000 already in use"**
```
Solution:
1. Change port in server.js:
   const PORT = process.env.PORT || 3001;
2. Or kill existing process:
   Windows: netstat -ano | findstr :3000
   Linux/Mac: lsof -ti :3000 | xargs kill
```

## Performance Issues

**Slow Email Generation:**
- Reduce MAX_EMAILS_PER_RUN
- Simplify EMAIL_GENERATION_PROMPT
- Check Gemini API status
- Increase EMAIL_DELAY

**High Memory Usage:**
- Clear old logs regularly
- Limit MAX_SEARCHES_PER_RUN
- Restart server periodically
- Check for memory leaks in custom code
