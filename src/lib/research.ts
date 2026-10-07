export type ResearchDepth = 'shallow' | 'medium' | 'deep'

export type ResearchResult = {
  topic: string
  overview: string
  keyFacts: string[]
  developments: string[]
  perspectives: string[]
  importantData: string[]
  sources: string[]
  contentAngles: string[]
  depth: ResearchDepth
}

// Research adapter interface - supports web search, news APIs, etc.
// This abstraction allows swapping providers without changing the engine
export interface ResearchAdapter {
  research(topic: string, depth: ResearchDepth): Promise<ResearchResult>
}

// Mock adapter for demonstration - in production would use real APIs
export class WebSearchAdapter implements ResearchAdapter {
  async research(topic: string, depth: ResearchDepth): Promise<ResearchResult> {
    // This would call real search APIs like:
    // - NewsAPI
    // - SerpApi
    // - Perplexity API
    // - Tavily
    
    // For now, return structure indicating research is needed
    return {
      topic,
      overview: '',
      keyFacts: [],
      developments: [],
      perspectives: [],
      importantData: [],
      sources: [],
      contentAngles: [],
      depth,
    }
  }
}