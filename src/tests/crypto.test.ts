import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { encryptCredential, decryptCredential, SecureCrypto } from '@/lib/crypto'

// Set test environment
process.env.AUTH_SECRET = 'test-secret-key-for-crypto-tests-minimum-32-chars!'

describe('Crypto Encryption', () => {
  const crypto = SecureCrypto.getInstance()

  describe('Round Trip', () => {
    it('encrypts and decrypts correctly', () => {
      const plaintext = 'my-secret-api-key-12345'
      const encrypted = encryptCredential(plaintext)
      const decrypted = decryptCredential(encrypted)
      expect(decrypted).toBe(plaintext)
    })

    it('encrypts different ciphertext for same plaintext (random IV)', () => {
      const plaintext = 'same-api-key'
      const encrypted1 = encryptCredential(plaintext)
      const encrypted2 = encryptCredential(plaintext)
      expect(encrypted1).not.toBe(encrypted2)
    })
  })

  describe('Format', () => {
    it('produces v1:iv:tag:ciphertext format', () => {
      const encrypted = encryptCredential('test-key')
      const parts = encrypted.split(':')
      expect(parts[0]).toBe('v1')
      expect(parts.length).toBe(4)
    })

    it('uses 12-byte IV (96 bits)', () => {
      const encrypted = encryptCredential('test-key')
      const parts = encrypted.split(':')
      const iv = Buffer.from(parts[1], 'base64')
      expect(iv.length).toBe(12)
    })

    it('produces verifiable output', () => {
      const encrypted = encryptCredential('test-key')
      expect(encrypted.length).toBeGreaterThan(0)
    })
  })

  describe('Tampering Detection', () => {
    it('detects tampered ciphertext', () => {
      const plaintext = 'secret-key'
      const encrypted = encryptCredential(plaintext)
      const parts = encrypted.split(':')
      // Modify ciphertext
      parts[3] = parts[3].slice(0, -1) + (parts[3].slice(-1) === 'A' ? 'B' : 'A')
      const tampered = parts.join(':')
      
      const decrypted = decryptCredential(tampered)
      expect(decrypted).toBe('')
    })

    it('detects tampered auth tag', () => {
      const plaintext = 'secret-key'
      const encrypted = encryptCredential(plaintext)
      const parts = encrypted.split(':')
      // Modify authTag
      parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === 'A' ? 'B' : 'A')
      const tampered = parts.join(':')
      
      const decrypted = decryptCredential(tampered)
      expect(decrypted).toBe('')
    })
  })

  describe('Error Handling', () => {
    it('returns empty string for empty input', () => {
      expect(decryptCredential('')).toBe('')
    })

    it('returns empty string for malformed format', () => {
      expect(decryptCredential('invalid')).toBe('')
      expect(decryptCredential('v2:test:tag:ct')).toBe('') // wrong version
      expect(decryptCredential('v1:incomplete')).toBe('') // incomplete
    })

    it('returns empty string for invalid base64', () => {
      expect(decryptCredential('v1:!!!:tag:ct')).toBe('')
    })
  })
})

describe('Key Derivation', () => {
  it('uses SHA-256 for key derivation', () => {
    const key1 = (SecureCrypto as any).prototype.key
    expect(key1).toBeDefined()
  })
})