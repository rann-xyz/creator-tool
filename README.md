# Creator Engine

A public web application for creating, researching, improving, rewriting, and repurposing content using your own AI providers.

## Key Principles

**BYOK (Bring Your Own Key)**: You connect your own AI provider. We never pay for your AI usage.

**Real Data Only**: No fake responses, no mock data, no demo mode. If your provider is configured, you get real output.

**Security First**: API keys are encrypted at rest, never exposed to frontends.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Set up database
npx prisma db push

# 4. Run development server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | 32+ character secret for sessions | ✅ |
| `NEXTAUTH_URL` | Your domain (e.g., https://creator-engine.vercel.app) | ✅ |

## Architecture

```
User
  ↓ (authenticated session)
Creator Engine
  ↓ (provider lookup)
User's Provider
  ↓ (decrypted key)
AI API
  ↓ (real response)
Content
```

### Provider System

Supports OpenAI-compatible APIs. Add providers via `/settings/providers`:

- Provider Name
- Protocol: OpenAI Compatible
- Base URL
- API Key
- Default Model

### Security

- ✅ API keys encrypted with AES-256-CBC
- ✅ Key derivation via SHA-256
- ✅ Never logged or returned to frontend
- ✅ Rate limiting on all endpoints
- ✅ Input sanitization
- ✅ IDOR protection

## Deployment

1. Fork this repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Development

```bash
# Run all checks
npm run typecheck
npm run lint
npm run test

# Build for production
npm run build
```

## License

MIT