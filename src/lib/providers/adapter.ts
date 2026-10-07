export type ProviderProtocol = 'OPENAI_COMPATIBLE' | 'ANTHROPIC_COMPATIBLE' | 'GOOGLE_COMPATIBLE'

export type ProviderConfig = {
  id: string
  name: string
  protocol: ProviderProtocol
  baseUrl?: string
  apiKey: string
  model?: string
}

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ChatResponse = {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIProviderAdapter {
  validateCredentials(): Promise<boolean>
  listModels(): Promise<string[]>
  chat(messages: ChatMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<ChatResponse>
}

// OpenAI-compatible adapter
export class OpenAICompatibleAdapter implements AIProviderAdapter {
  constructor(private config: ProviderConfig) {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        return false
      }

      // Verify we can actually list models
      const data = await response.json()
      return Array.isArray(data.data) || Array.isArray(data.object)
    } catch {
      return false
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to list models')
      }

      const data = await response.json()

      // OpenAI format: { data: [{id: 'model-name'}] }
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((m: { id: string }) => m.id)
      }

      // Alternative format
      return []
    } catch {
      return []
    }
  }

  async chat(messages: ChatMessage[], options: { maxTokens?: number; temperature?: number } = {}): Promise<ChatResponse> {
    const body = {
      model: this.config.model ?? 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

    // Handle specific error codes
    if (!response.ok) {
      const status = response.status
      let errorMessage = 'API request failed'

      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message ?? errorMessage
      } catch {
        // Ignore JSON parse errors
      }

      if (status === 401) {
        throw new Error('Authentication failed: Invalid API key')
      }

      if (status === 403) {
        throw new Error('Access forbidden: Check your permissions')
      }

      if (status === 404) {
        throw new Error(`Model not found: ${body.model}`)
      }

      if (status === 429) {
        throw new Error('Rate limit exceeded: Please wait and try again')
      }

      if (status >= 500) {
        throw new Error('Provider server error')
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      usage: data.usage,
    }
  }
}

// Factory function
export function createProviderAdapter(config: ProviderConfig): AIProviderAdapter {
  switch (config.protocol) {
    case 'OPENAI_COMPATIBLE':
      return new OpenAICompatibleAdapter(config)
    case 'ANTHROPIC_COMPATIBLE':
      throw new Error('Anthropic adapter not implemented')
    case 'GOOGLE_COMPATIBLE':
      throw new Error('Google Gemini adapter not implemented')
    default:
      throw new Error(`Unknown protocol: ${config.protocol}`)
  }
}