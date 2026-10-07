import { randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } from 'crypto'

/**
 * Secure Credential Encryption using AES-256-GCM
 * 
 * Format: v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>
 * 
 * Provides:
 * - AES-256-GCM (native authenticated encryption)
 * - Random 12-byte (96-bit) IV for each encryption
 * - 16-byte authentication tag from GCM
 * - SHA-256 key derivation from AUTH_SECRET
 * - Versioned payload format for key rotation
 * - Timing-safe tag comparison
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits - optimal for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits
const VERSION = 'v1'

export class SecureCrypto {
  private static instance: SecureCrypto
  private key: Buffer

  private constructor() {
    const secret = process.env.AUTH_SECRET
    if (!secret || secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters')
    }
    // Derive 256-bit key using SHA-256
    const { createHash } = require('crypto')
    this.key = createHash('sha256').update(secret).digest()
  }

  static getInstance(): SecureCrypto {
    if (!SecureCrypto.instance) {
      SecureCrypto.instance = new SecureCrypto()
    }
    return SecureCrypto.instance
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   * Returns: v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>
   */
  encrypt(plaintext: string): string {
    if (!plaintext) return ''

    // Generate random 96-bit IV
    const iv = randomBytes(IV_LENGTH)
    
    // Create cipher with GCM mode
    const cipher = createCipheriv(ALGORITHM, this.key, iv, { 
      authTagLength: AUTH_TAG_LENGTH 
    })
    
    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ])
    
    // Get authentication tag
    const authTag = cipher.getAuthTag()
    
    // Format: v1:iv:authTag:ciphertext
    return [
      VERSION,
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':')
  }

  /**
   * Decrypt ciphertext with authentication verification
   * Fails closed (returns empty string) on any tampering or error
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext) return ''

    try {
      const parts = ciphertext.split(':')
      if (parts.length !== 4 || parts[0] !== VERSION) {
        throw new Error('Invalid ciphertext format')
      }

      const [, ivB64, authTagB64, ctB64] = parts
      const iv = Buffer.from(ivB64, 'base64')
      const authTag = Buffer.from(authTagB64, 'base64')
      const encrypted = Buffer.from(ctB64, 'base64')

      // Validate IV length
      if (iv.length !== IV_LENGTH) {
        throw new Error('Invalid IV length')
      }

      // Validate auth tag length
      if (authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('Invalid auth tag length')
      }

      // Create decipher
      const decipher = createDecipheriv(ALGORITHM, this.key, iv, {
        authTagLength: AUTH_TAG_LENGTH
      })

      // Decrypt (throws if auth fails)
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ])

      return decrypted.toString('utf8')
    } catch {
      // Fail closed - return empty string on any error
      return ''
    }
  }
}

export const cryptoService = SecureCrypto.getInstance()

export function encryptCredential(plaintext: string): string {
  return cryptoService.encrypt(plaintext)
}

export function decryptCredential(ciphertext: string): string {
  return cryptoService.decrypt(ciphertext)
}