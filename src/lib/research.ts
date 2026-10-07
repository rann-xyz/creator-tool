import { ProviderProtocol, type AIProviderAdapter, type ChatMessage } from '@/lib/providers/adapter'

// Research adapter for Tavily API
export class TavilyResearchAdapter {
  private apiKey: string
  private baseUrl = 'https://api.tavily.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async search(query: string, depth: 'shallow' | 'medium' | 'deep' = 'medium') {
    const maxResults = depth === 'shallow' ? 5 : depth === 'medium' ? 10 : 20
    
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: depth,
      }),
    })

    if (!response.ok) {
      throw new Error('Research API request failed')
    }

    const data = await response.json()
    
    return this.processResults(data)
  }

  private processResults(data: any) {
    const results = data.results ?? []
    
    return {
      topic: data.query ?? 'Unknown',
      overview: results.slice(0, 3).map((r: any) => r.title).join('. '),
      keyFacts: results.map((r: any) => r.title),
      developments: [],
      perspectives: [],
      importantData: results.map((r: any) => r.content?.slice(0, 200)).filter(Boolean),
      sources: results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content?.slice(0, 300),
      })),
      contentAngles: results.slice(0, 5).map((r: any) => r.title),
    }
  }
}