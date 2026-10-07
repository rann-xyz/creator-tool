import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type ProviderConfig, createProviderAdapter } from '@/lib/providers/adapter'
import { decryptCredential } from '@/lib/crypto'
import { z } from 'zod'

// Research with Tavily
const TAVILY_API_KEY = process.env.TAVILY_API_KEY

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!TAVILY_API_KEY) {
    return NextResponse.json({ 
      error: 'Research provider not configured. Set TAVILY_API_KEY environment variable.', 
      details: 'Contact administrator'
    }, { status: 503 })
  }

  const schema = z.object({
    topic: z.string().min(1),
    depth: z.enum(['shallow', 'medium', 'deep']).optional().default('medium'),
  })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: data.topic,
        max_results: data.depth === 'shallow' ? 5 : data.depth === 'medium' ? 10 : 20,
        search_depth: data.depth,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Research API request failed' }, { status: 502 })
    }

    const tavilyData = await response.json()
    
    const results = (tavilyData.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.slice(0, 300),
      score: r.score,
    }))

    return NextResponse.json({
      topic: data.topic,
      depth: data.depth,
      results,
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Research failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const researches = await prisma.research.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return NextResponse.json(researches)
}