import { type ProviderConfig, createProviderAdapter, type ChatResponse, ProviderProtocol } from '@/lib/providers/adapter'
import { decryptCredential } from '@/lib/crypto'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Get user's default provider
async function getDefaultProvider(userId: string) {
  const provider = await prisma.provider.findFirst({
    where: {
      userId,
      isDefault: true,
      isActive: true,
    },
  })

  if (!provider) return null

  return {
    id: provider.id,
    name: provider.name,
    protocol: provider.protocol,
    baseUrl: provider.baseUrl ?? undefined,
    apiKey: decryptCredential(provider.apiKey),
    model: provider.model ?? undefined,
  }
}

// Build system prompt
function buildSystemPrompt(format?: string, platform?: string): string {
  return `You are Creator Engine, an expert content creation AI.
  
Generate high-quality, engaging content optimized for ${format ?? 'general content'} on ${platform ?? 'general'} platforms.
Focus on clarity, hook, value, engagement, and platform-specific conventions.
Use active voice and vivid language.
Keep paragraphs short and scannable.
  
Format: ${format ?? 'general content'}
Platform: ${platform ?? 'general'}`
}

// Stream generation response
export async function* streamGenerate(
  config: ProviderConfig,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  const adapter = createProviderAdapter(config)
  const decoder = new TextDecoder('utf-8')

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model ?? 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }),
  })

  if (!response.ok || !response.body) {
    throw new Error('Provider request failed')
  }

  const reader = response.body.getReader()
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
            yield content
          }
        } catch {
          // Ignore parse errors in streaming
        }
      }
    }
  }

  return fullContent
}

// Main generation function
export async function generateContent(
  userId: string,
  input: {
    prompt: string
    format?: string
    platform?: string
    context?: string
  }
): Promise<{ success: true; content: string } | { success: false; error: string }> {
  const provider = await getDefaultProvider(userId)

  if (!provider) {
    return { success: false, error: 'No AI provider configured. Connect a provider in Settings.' }
  }

  const adapter = createProviderAdapter(provider)

  // Build messages
  const messages = [
    { role: 'system', content: buildSystemPrompt(input.format, input.platform) },
    ...(input.context ? [{ role: 'user' as const, content: `Context: ${input.context}` }] : []),
    { role: 'user', content: input.prompt },
  ]

  try {
    const response = await adapter.chat(messages, {
      maxTokens: 2000,
      temperature: 0.7,
    })

    // Self-review pass
    const reviewResponse = await adapter.chat([
      { role: 'system', content: messages[0].content },
      { role: 'user', content: `Review and improve this content for clarity and engagement:\n\n${response.content}` },
    ], { maxTokens: 2000, temperature: 0.5 })

    return { success: true, content: reviewResponse.content }
  } catch (error: any) {
    logger.error('Generation error', { error: error.message })
    if (error.message?.includes('rate limit')) {
      return { success: false, error: 'Rate limited. Please wait and try again.' }
    }
    if (error.message?.includes('timeout')) {
      return { success: false, error: 'Request timeout. Please try again.' }
    }
    return { success: false, error: 'Generation failed. Please check your provider settings.' }
  }
}