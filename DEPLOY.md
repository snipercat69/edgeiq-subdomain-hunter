# EdgeIQ Subdomain Hunter — Cloudflare Worker Deployment

## Prerequisites
- Node.js 18+ installed
- Wrangler CLI (`npm install -g wrangler`)
- A Cloudflare account (free at cloudflare.com)

## Setup

```bash
cd edgeiq-subdomain-hunter
```

## Deploy

```bash
# Login to Cloudflare (opens browser)
npx wrangler login

# Deploy the worker
npx wrangler deploy

# Your worker URL will be:
# https://edgeiq-subdomain-hunter.<your-subdomain>.workers.dev
```

## Configuration

### Environment Variables (via wrangler.toml)

```toml
[vars]
ALLOWED_ORIGIN = "https://edgeiqlabs.com"
```

### Optional Secrets

```bash
# No secrets required for subdomain enumeration
# The worker uses crt.sh public API directly
```

## Custom Domain (Optional)

To bind to a subdomain on edgeiqlabs.com:

```bash
# In wrangler.toml
routes = [
  { pattern = "subdomains.edgeiqlabs.com", zone_name = "edgeiqlabs.com" }
]
```

Then redeploy:
```bash
npx wrangler deploy
```

## Testing

```bash
# Local dev server
npx wrangler dev

# Test with curl
curl -X POST https://edgeiq-subdomain-hunter.gpalmieri21.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"domain": "google.com"}'
```

## API Reference

```
POST https://edgeiq-subdomain-hunter.gpalmieri21.workers.dev
Content-Type: application/json

Body:
{
  "domain": "example.com",   // required
  "limit": 200              // optional, max 500
}

Response:
{
  "domain": "example.com",
  "total": 47,
  "subdomains": [
    {
      "subdomain": "www.example.com",
      "first_seen": "2024-01-15",
      "expiry": "2025-01-15"
    },
    ...
  ]
}
```

## Rate Limits

- crt.sh public API is rate-limited to ~300 requests/minute
- The worker caches results for 1 hour via Cloudflare's CDN
- For higher limits, consider adding your own caching layer or proxy
