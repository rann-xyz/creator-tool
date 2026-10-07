import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type ProviderConfig, createProviderAdapter } from '@/lib/providers/adapter'
import { decryptCredential } from '@/lib/crypto'
import { z } from 'zod'

const repurposeSchema = z.object({
  content: z.string().min(1),
  platforms: z.array(z.string()),
  tone: z.string().optional(),
  instructions: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = repurposeSchema.parse(body)

    // Get user's default provider
    const provider = await prisma.provider.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
        isActive: true,
      },
    })

    if (!provider) {
      return NextResponse.json({ error: 'No AI provider configured. Connect a provider in Settings.' }, { status: 400 })
    }

    // Decrypt API key
    const decryptedKey = decryptCredential(provider.apiKey)

    // Build adapter
    const config: ProviderConfig = {
      id: provider.id,
      name: provider.name,
      protocol: provider.protocol,
      baseUrl: provider.baseUrl!,
      apiKey: decryptedKey,
      model: provider.model!,
    }

    const adapter = createProviderAdapter(config)
    const results: Record<string, string> = {}

    // Generate content for each platform
    for (const platform of data.platforms) {
      const messages = [
        { 
          role: 'system' as const, 
          content: `You are a content creator specialized in ${platform}. Repurpose the following content for ${platform}.` 
        },
        { 
          role: 'user' as const, 
          content: `Original content:\n${data.content}\n\nTone: ${data.tone || 'professional'}\n\nInstructions: ${data.instructions || 'None'}` 
        },
      ]

      try {
        const response = await adapter.chat(messages, { maxTokens: 500 })
        results[platform] = response.content
      } catch (e) {
        results[platform] = `Error generating for ${platform}`
      }
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Repurposing failed' }, { status: 500 })
  }
}