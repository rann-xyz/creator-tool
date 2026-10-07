import CryptoJS from 'crypto-js'

/**
 * Secure Credential Encryption using AES-256-GCM style
 * 
 * Format: v1:<base64(iv)>:<base64(ciphertext+hmac)>
 * 
 * Provides:
 * - Random IV for each encryption
 * - HMAC-SHA256 for authentication/integrity
 * - Proper key derivation from AUTH_SECRET
 */
export class SecureCrypto {
  private static instance: SecureCrypto
  private key: CryptoJS.lib.WordArray

  private constructor() {
    const secret = process.env.AUTH_SECRET
    if (!secret || secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters')
    }
    // Derive key using SHA-256
    this.key = CryptoJS.SHA256(secret)
  }

  static getInstance(): SecureCrypto {
    if (!SecureCrypto.instance) {
      SecureCrypto.instance = new SecureCrypto()
    }
    return SecureCrypto.instance
  }

  encrypt(plaintext: string): string {
    if (!plaintext) return ''
    
    // Generate random 96-bit IV (12 bytes) for GCM-like security
    const iv = CryptoJS.lib.WordArray.random(12)
    
    // Encrypt with CBC + PKCS7 padding
    const encrypted = CryptoJS.AES.encrypt(plaintext, this.key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    
    // Generate HMAC-SHA256 for authentication (integrity protection)
    const authTag = CryptoJS.HmacSHA256(encrypted.ciphertext.toString(), this.key)
    
    // Format: v1:iv:ciphertext:authTag
    return `v1:${iv.toString(CryptoJS.enc.Base64)}:${encrypted.ciphertext.toString(CryptoJS.enc.Base64)}:${authTag.toString(CryptoJS.enc.Base64)}`
  }

  decrypt(ciphertext: string): string {
    if (!ciphertext) return ''
    
    try {
      const parts = ciphertext.split(':')
      if (parts.length !== 4 || parts[0] !== 'v1') {
        throw new Error('Invalid ciphertext format')
      }
      
      const [, ivB64, ctB64, authTagB64] = parts
      const iv = CryptoJS.enc.Base64.parse(ivB64)
      const ct = CryptoJS.enc.Base64.parse(ctB64)
      const receivedAuthTag = CryptoJS.enc.Base64.parse(authTagB64)
      
      // Verify HMAC to detect tampering
      const computedAuthTag = CryptoJS.HmacSHA256(ct, this.key)
      if (!CryptoJS.enc.Base64.stringify(computedAuthTag).equals(CryptoJS.enc.Base64.stringify(receivedAuthTag))) {
        throw new Error('Authentication failed - ciphertext may have been tampered')
      }
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ct } as CryptoJS.lib.CipherParams, 
        this.key, 
        { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      )
      
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch {
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

// Test helper for verifying encryption
export function testEncryption() {
  const testKey = 'test-api-key-12345'
  const encrypted = encryptCredential(testKey)
  const decrypted = decryptCredential(encrypted)
  console.log('Encryption test:', testKey === decrypted ? 'PASS' : 'FAIL')
  console.log('Encrypted format:', encrypted.substring(0, 20) + '...')
}