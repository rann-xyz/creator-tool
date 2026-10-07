import { createServerInstance, type NextApiRequest, type NextApiResponse } from 'next-connect'

// Rate limiter
const rateLimits = new Map<string, { count: number; reset: number }>()

export function withRateLimit(
  handler: CallableFunction,
  opts: { max: number; windowMs: number } = { max: 100, windowMs: 60000 }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip = req.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const record = rateLimits.get(ip) || { count: 0, reset: now + opts.windowMs }
    
    if (now > record.reset) {
      record.count = 0
      record.reset = now + opts.windowMs
    }
    
    record.count++
    rateLimits.set(ip, record)
    
    if (record.count > opts.max) {
      return res.status(429).json({ error: 'Rate limited' })
    }
    
    return handler(req, res)
  }
}

// Input sanitizer
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return ''
  return input.slice(0, maxLength).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}