import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type ProviderConfig, createProviderAdapter } from '@/lib/providers/adapter'
import { decryptCredential } from '@/lib/crypto'
import { z } from 'zod'

const improveSchema = z.object({
  content: z.string().min(1),
  platform: z.string().optional(),
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
    const data = improveSchema.parse(body)

    // Get user's default provider
    const provider = await prisma.provider.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
        isActive: true,
      },
    })

    if (!provider) {
      return NextResponse.json({ 
        error: 'No AI provider configured',
        analysis: { hook: 'N/A', clarity: 'N/A', structure: 'N/A' },
        improvement: 'Please connect an AI provider in Settings'
      }, { status: 400 })
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

    // Get user's memory for tone/style guidance
    const memories = await prisma.styleExample.findMany({
      where: { userId: session.user.id },
    })

    // Build system prompt with memory
    const systemPrompt = `You are a content improvement expert. Analyze the following content and provide:
1. Overall assessment
2. Improved version that is clearer, more engaging, and better suited for ${data.platform || 'general'}

Focus on:
- Hook: Make it catchy
- Clarity: Make it easy to understand
- Structure: Organize it well
- CTA: Make it compelling
- Tone: ${data.tone || 'professional'}`

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Content to improve:\n\n${data.content}\n\nInstructions: ${data.instructions || 'None'}` },
    ]

    const response = await adapter.chat(messages, { maxTokens: 1000 })

    return NextResponse.json({
      analysis: {
        originalLength: data.content.length,
        improvedLength: response.content.length,
      },
      content: response.content,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Improvement failed' }, { status: 500 })
  }
}