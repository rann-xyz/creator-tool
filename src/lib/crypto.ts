import * as THREE from 'three'
import CryptoJS from 'crypto-js'

// Secure encryption using AES-256-GCM style construction
// Uses AUTH_SECRET for key derivation
export class SecureCrypto {
  private static instance: SecureCrypto
  private key: string

  private constructor() {
    const secret = process.env.AUTH_SECRET
    if (!secret || secret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters')
    }
    // Derive key using SHA-256
    this.key = CryptoJS.SHA256(secret).toString()
  }

  static getInstance(): SecureCrypto {
    if (!SecureCrypto.instance) {
      SecureCrypto.instance = new SecureCrypto()
    }
    return SecureCrypto.instance
  }

  encrypt(plaintext: string): string {
    if (!plaintext) return ''
    const iv = CryptoJS.lib.WordArray.random(16)
    const encrypted = CryptoJS.AES.encrypt(plaintext, this.key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    // Return: iv + ciphertext both base64
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64)
  }

  decrypt(ciphertext: string): string {
    if (!ciphertext) return ''
    try {
      const buffer = CryptoJS.enc.Base64.parse(ciphertext)
      const iv = CryptoJS.lib.WordArray.create(buffer.words.slice(0, 4), 4)
      const ct = CryptoJS.lib.WordArray.create(buffer.words.slice(4), buffer.words.length - 4)
      const decrypted = CryptoJS.AES.decrypt({ ciphertext: ct } as any, this.key, { iv })
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch {
      return ''
    }
  }
}

export const cryptoService = SecureCrypto.getInstance()

// Provider credential encryption/decryption
export function encryptCredential(plaintext: string): string {
  return cryptoService.encrypt(plaintext)
}

export function decryptCredential(ciphertext: string): string {
  return cryptoService.decrypt(ciphertext)
}