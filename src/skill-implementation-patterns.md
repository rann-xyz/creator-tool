# Creator Engine Implementation Patterns

## Overview

Skill for implementing BYOK AI content creation platforms with proper security, authentication, and testing.

## Key Patterns

### Authentication
- Use NextAuth with Credentials provider
- Derive userId from session, never trust client input
- Protected routes: `if (!session?.user?.id)` → 401

### Encryption
- AES-256-CBC + HMAC-SHA256 authenticated encryption
- Format: `v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>`
- 12-byte random IV per encryption
- HMAC for integrity verification

### IDOR Protection
All queries must include userId scope:
```
where: { id, userId: session.user.id }
```

### Provider Architecture
- OpenAI-compatible primary adapter
- Custom base URL support
- Real connection testing
- Ownership verification

### Research
- Tavily API integration
- Server-side HTTP only
- Source URL preservation
- Clear config error when missing

### Testing
- Crypto round-trip tests
- Tampering detection tests
- IDOR protection tests
- Authorization boundary tests

## References
- `docs/creator-engine-patterns.md` - Implementation details
- `src/lib/crypto.ts` - Encryption implementation
- `src/tests/` - Test patterns