# Build Verification Reference

## Commands to Run

```bash
npm install                    # Install dependencies
npx prisma validate           # Validate schema
npx prisma generate           # Generate client
npm run lint                  # ESLint
npm run typecheck             # TypeScript check: npx tsc --noEmit
npm test                      # Vitest tests
npm run build                 # Production build
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "prisma:generate": "prisma generate",
    "prisma:validate": "prisma validate"
  }
}
```

## Environment Variables

Required:
- DATABASE_URL (PostgreSQL)
- AUTH_SECRET (32+ chars)
- NEXTAUTH_URL
- TAVILY_API_KEY (for research)

## Common Build Issues

1. ESLint config needs: `globals`, `typescript-eslint`, `react-hooks` plugins
2. tsconfig needs proper `paths` for `@/*` aliases
3. Prisma requires DATABASE_URL to be set
4. Vitest needs proper test setup