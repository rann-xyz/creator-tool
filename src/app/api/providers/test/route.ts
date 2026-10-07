import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type ProviderConfig, createProviderAdapter, ProviderProtocol } from '@/lib/providers/adapter'
import { decryptCredential, encryptCredential } from '@/lib/crypto'
import { z } from 'zod'

const testSchema = z.object({
  protocol: z.enum(['OPENAI_COMPATIBLE', 'ANTHROPIC_COMPATIBLE', 'GOOGLE_COMPATIBLE']),
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = testSchema.parse(body)

    // Build temporary config - never stored
    const config: ProviderConfig = {
      id: crypto.randomUUID(),
      name: 'Test Provider',
      protocol: data.protocol as ProviderProtocol,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
      model: data.model,
    }

    // Create adapter and test
    const adapter = createProviderAdapter(config)

    // 1. Validate credentials (real API request)
    let valid = false
    try {
      valid = await adapter.validateCredentials()
    } catch (error) {
      console.error('Validation error:', error)
    }

    if (!valid) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Try to list models
    let models: string[] = []
    try {
      models = await adapter.listModels()
    } catch (error) {
      console.error('List models error:', error)
    }

    // 3. Check model availability if provided
    if (data.model && models.length > 0 && !models.includes(data.model)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Model "${data.model}" not available. Available: ${models.slice(0, 5).join(', ')}`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, models }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ success: false, error: 'Test failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}