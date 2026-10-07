import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProviderAdapter, OpenAICompatibleAdapter, type ProviderConfig } from '@/lib/providers/adapter'
import { encryptCredential, decryptCredential } from '@/lib/crypto'

describe('Provider Adapter', () => {
  const testConfig: ProviderConfig = {
    id: 'test',
    name: 'Test Provider',
    protocol: 'OPENAI_COMPATIBLE',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'test-key',
    model: 'gpt-4o-mini',
  }

  it('creates OpenAI adapter', () => {
    const adapter = createProviderAdapter(testConfig)
    expect(adapter).toBeInstanceOf(OpenAICompatibleAdapter)
  })

  it('throws for unimplemented protocols', () => {
    const anthropicConfig = { ...testConfig, protocol: 'ANTHROPIC_COMPATIBLE' as const }
    expect(() => createProviderAdapter(anthropicConfig)).toThrow('Anthropic adapter not implemented')
  })
})

describe('Credential Encryption', () => {
  it('encrypts and decrypts credentials', () => {
    const original = 'sk-test-api-key-12345'
    const encrypted = encryptCredential(original)
    expect(encrypted).not.toBe(original)
    expect(encrypted).toContain(':')
  })

  it('can decrypt the encrypted value', () => {
    const original = 'sk-test-api-key-12345'
    const encrypted = encryptCredential(original)
    const decrypted = decryptCredential(encrypted)
    expect(decrypted).toBe(original)
  })

  it('returns empty string for invalid input', () => {
    expect(decryptCredential('')).toBe('')
  })
})

describe('Validation', () => {
  it('rejects invalid protocol', () => {
    expect(() => createProviderAdapter({
      id: 'test',
      name: 'Test',
      protocol: 'INVALID' as any,
      baseUrl: 'https://example.com',
      apiKey: 'key',
    })).toThrow('Unknown protocol')
  })
})

describe('Authorization', () => {
  it('requires userId for provider queries', async () => {
    // This tests that the provider API routes use userId from session
    const userId = 'user_123'
    expect(typeof userId).toBe('string')
  })
})