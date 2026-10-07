import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type ProviderConfig, createProviderAdapter } from '@/lib/providers/adapter'
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

    // Build temporary provider config (no storage)
    const config: ProviderConfig = {
      id: 'test-connection',
      name: 'Test Provider',
      protocol: data.protocol,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
      model: data.model,
    }

    const adapter = createProviderAdapter(config)

    // 1. Validate credentials
    let valid = false
    try {
      valid = await adapter.validateCredentials()
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Credential validation failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!valid) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed: Invalid API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. List models
    let models: string[] = []
    try {
      models = await adapter.listModels()
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Could not list models from provider' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Check model availability
    if (data.model && !models.includes(data.model)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Model "${data.model}" not available. Available: ${models.slice(0, 10).join(', ')}`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      success: true,
      models,
    }), { status: 200 })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request data' }), {
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