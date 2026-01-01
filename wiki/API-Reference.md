# API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
No authentication required for local development.

## Endpoints

### Client Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clients` | GET | Get all clients (with filters) |
| `/api/clients/:id` | GET | Get single client |
| `/api/clients/:id` | PUT | Update client |
| `/api/clients/:id` | DELETE | Delete client |
| `/api/clients/:id/send` | POST | Send email to client |
| `/api/clients/:id/regenerate` | POST | Regenerate email with AI |

**GET /api/clients**
Query Parameters:
- `status`: "sent" | "unsent"
- `niche`: string

Example:
```
GET /api/clients?status=unsent&niche=restaurant
```

Response:
```json
[
  {
    "$id": "unique-id",
    "email": "contact@restaurant.com",
    "niche": "restaurant",
    "platform": "instagram.com",
    "emailSent": false,
    "emailSubject": "...",
    "emailBody": "...",
    "foundDate": "2024-01-01T12:00:00Z"
  }
]
```

**PUT /api/clients/:id**
Body:
```json
{
  "emailSubject": "Updated subject",
  "emailBody": "Updated body..."
}
```

### Automation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/automate/step1-search` | POST | Run web search |
| `/api/automate/step2-generate` | POST | Generate emails |
| `/api/automate/step3-confirm` | POST | Confirm data |
| `/api/automate/step4-send` | POST | Send all emails |
| `/api/automate/reset` | POST | Reset automation state |

**POST /api/automate/step1-search**
Body:
```json
{
  "niche": "coffee shop",
  "country": "us",
  "emailProvider": "gmail.com",
  "platforms": "instagram.com,facebook.com"
}
```

### Configuration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings` | GET | Get all settings |
| `/api/settings` | POST | Update settings |
| `/api/stats` | GET | Get dashboard statistics |

**GET /api/stats**
Response:
```json
{
  "totalClients": 45,
  "emailsSent": 12,
  "unsentEmails": 33
}
```

### Real-time events

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events` | GET | Server-Sent Events stream |

**Event Types:**
- `log`: Log messages
- `state`: Automation state updates
