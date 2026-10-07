import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ideasSchema = z.object({
  topic: z.string().min(1),
  niche: z.string().optional(),
  audience: z.string().optional(),
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
    const data = ideasSchema.parse(body)

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
        ideas: [],
        message: 'Connect an AI provider in Settings to generate ideas'
      }, { status: 400 })
    }

    // Decrypt API key
    const { decryptCredential } = await import('@/lib/crypto')
    const decryptedKey = decryptCredential(provider.apiKey)

    // Build adapter
    const config: import('@/lib/providers/adapter').ProviderConfig = {
      id: provider.id,
      name: provider.name,
      protocol: provider.protocol,
      baseUrl: provider.baseUrl!,
      apiKey: decryptedKey,
      model: provider.model!,
    }

    const adapter = createProviderAdapter(config)

    // Get user's memory
    const memories = await prisma.styleExample.findMany({
      where: { userId: session.user.id },
    })
    const memoryContext = memories.length > 0 
      ? `\nUser preferences: ${memories.map(m => m.content).join('; ')}`
      : ''

    // Build prompt
    const systemPrompt = `You are an idea generation expert. Generate 5 creative, actionable ideas for: ${data.topic}
Audience: ${data.audience || 'general'}
Platform: ${data.platform || 'blogs'}
Tone: ${data.tone || 'professional'}
${memoryContext}
Output ONLY valid JSON in this format:
{
  "ideas": [
    {
      "topic": "main focus",
      "hook": "compelling opening line",
      "angle": "unique perspective",
      "whyWorks": "brief explanation"
    }
  ]
}`

    const messages = [
      { role: 'user', content: systemPrompt },
    ]

    const response = await adapter.chat(messages, { maxTokens: 1500 })

    // Parse JSON response
    try {
      const parsed = JSON.parse(response.content)
      // Create saved ideas
      const savedIdeas = await Promise.all(
        parsed.ideas.map((idea: any) =>
          prisma.idea.create({
            data: {
              userId: session.user.id,
              topic: data.topic,
              hook: idea.hook,
              angle: idea.angle,
              whyWorks: idea.whyWorks,
              suggestedFormat: data.platform || 'blog_post',
              audience: data.audience,
            },
          }),
        ),
      )

      return NextResponse.json({
        ideas: savedIdeas.map(i => ({ id: i.id, topic: i.topic, hook: i.hook, angle: i.angle, whyWorks: i.whyWorks })),
      })
    } catch (parseError) {
      // If not valid JSON, return raw response
      return NextResponse.json({ ideas: [{ topic: data.topic, hook: response.content }] })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Idea generation failed' }, { status: 500 })
  }
}

// Import createProviderAdapter at module level for better performance
async function createProviderAdapter(config: import('@/lib/providers/adapter').ProviderConfig) {
  const { OpenAICompatibleAdapter } = await import('@/lib/providers/adapter')
  return new OpenAICompatibleAdapter(config)
}