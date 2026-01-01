# Feature Deep Dive

## 1. Web Search (Step 1)

**How it works:**
- Uses SerpAPI to search Google with specific queries
- Searches across multiple platforms simultaneously
- Extracts email addresses from search results
- Filters by email provider (e.g., only Gmail addresses)

**Best Practices:**
- Use specific niches: "italian restaurant" > "restaurant"
- Target one country at a time for better results
- Popular email domains: gmail.com, yahoo.com, outlook.com
- Test with 1-2 platforms first before scaling

**Example Searches:**
```
Niche: coffee shop
Country: us
Email Domain: gmail.com
Platforms: instagram.com, facebook.com

This searches: "site:instagram.com coffee shop us @gmail.com"
```

## 2. Email Generation (Step 2)

**How it works:**
- Uses Google Gemini AI Pro model
- Generates unique emails for each client
- Incorporates your custom prompt and template
- Uses client context (niche, platform, email)

**Optimization Tips:**
- Set clear EMAIL_GENERATION_PROMPT
- Use specific templates with variables
- Review first few generated emails
- Adjust prompt if output isn't satisfactory

## 3. Bulk Operations

**Selection:**
- Click checkboxes to select individual clients
- Use "Select All" to select all visible clients
- Selection persists through filtering

**Actions:**
- **Generate Emails**: Regenerate for selected clients
- **Send Emails**: Send immediately to selected (500ms delay between)
- **Delete**: Permanently remove from database

**Safety:**
- All bulk actions require confirmation
- Shows success/failure counts
- Automatic refresh after completion

## 4. Filtering & Sorting

**Filter Options:**
- **Status**: All / Sent / Unsent
- **Niche**: Dynamically populated from data
- **Platform**: Dynamically populated from data

**Sort Options:**
- Date (Newest first / Oldest first)
- Email (A-Z / Z-A)
- Niche (A-Z)

**Pro Tip:** Combine filters for laser-focused targeting
- Example: "Unsent" + "restaurant" + "instagram.com"
