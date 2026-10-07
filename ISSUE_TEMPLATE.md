---
name: "Creator Engine"
about: "AI content creation platform"
title: ""
labels: []
---

Creator Engine - A BYOK AI content creation platform

## What's Included
- Authentication (signup/login/logout)
- Provider management with encrypted credentials
- Content creation workflow
- Research integration (Tavily adapter)
- Library management
- Creator memory system

## How to Deploy to Vercel
1. Set DATABASE_URL (PostgreSQL)
2. Set AUTH_SECRET (32+ chars)
3. Set NEXTAUTH_URL
4. Run `npx prisma db push` on first deploy

## Environment Variables
```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=https://your-domain.vercel.app
```