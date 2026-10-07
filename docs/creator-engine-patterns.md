# Creator Engine Implementation Patterns

## Overview

This skill documents the patterns and practices for implementing a complete BYOK (Bring Your Own Key) AI content creation platform with proper security, authentication, and testing.

## Key Implementation Patterns

### 1. Authentication Flow

Use NextAuth with Credentials provider for email/password auth:
- Server-side session verification via `auth()` helper
- Always derive userId from session, never trust client input
- Protected routes check `session?.user?.id`

```typescript
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. Credential Encryption

AES-256-CBC with HMAC-SHA256 for authenticated encryption:
- Format: `v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>`
- 12-byte random IV per encryption
- HMAC for integrity verification
- Never log plaintext credentials

### 3. Provider Architecture

Support OpenAI-compatible endpoints as primary:
- Custom base URL support
- Model selection
- Connection testing via real HTTP requests
- Provider ownership verification (userId-scoped)

### 4. IDOR Protection

All database queries must include `userId: session.user.id`:
```typescript
await prisma.provider.findFirst({
  where: { id, userId: session.user.id }
})
```

### 5. Research Integration

Tavily API for real research:
- Server-side HTTP requests only
- Source URL preservation
- Clear error when key missing

### 6. Testing Patterns

- Crypto round-trip tests
- Tampering detection tests
- IDOR protection tests
- Authorization boundary tests

## Files

See `references/` for implementation details and templates.