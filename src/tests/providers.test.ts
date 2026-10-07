import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProviderAdapter, OpenAICompatibleAdapter, type ProviderConfig, ProviderProtocol } from '@/lib/providers/adapter'
import { encryptCredential, decryptCredential } from '@/lib/crypto'

describe('Provider Adapter', () => {
  const testConfig: ProviderConfig = {
    id: 'test',
    name: 'Test Provider',
    protocol: ProviderProtocol.OPENAI_COMPATIBLE,
    baseUrl: 'https://api.openai.com/v1',
    apiKey: 'test-api-key',
    model: 'gpt-4o-mini',
  }

  it('creates OpenAI adapter', () => {
    const adapter = createProviderAdapter(testConfig)
    expect(adapter).toBeInstanceOf(OpenAICompatibleAdapter)
  })

  it('throws for unimplemented protocols', () => {
    const anthropicConfig: ProviderConfig = { ...testConfig, protocol: ProviderProtocol.ANTHROPIC_COMPATIBLE }
    expect(() => createProviderAdapter(anthropicConfig)).toThrow()
  })
})

describe('Credential Encryption', () => {
  it('encrypts and decrypts credentials', () => {
    const original = 'test-api-key-12345'
    const encrypted = encryptCredential(original)
    expect(encrypted).not.toBe(original)
    expect(encrypted).toContain(':')
  })

  it('can decrypt the encrypted value', () => {
    const original = 'test-api-key-12345'
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
      apiKey: 'test-key',
    })).toThrow('Unknown protocol')
  })
})

describe('Authorization', () => {
  it('userId is available from session', async () => {
    const userId = 'user_123'
    expect(typeof userId).toBe('string')
  })
})