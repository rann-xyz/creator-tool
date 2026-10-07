'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function RewritePage() {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session.data) {
    router.push('/login')
    return null
  }

  const rewriteOptions = [
    { value: 'clearer', label: 'Make clearer' },
    { value: 'shorter', label: 'Make shorter' },
    { value: 'sharper', label: 'Make sharper' },
    { value: 'casual', label: 'Make more casual' },
    { value: 'professional', label: 'Make more professional' },
    { value: 'better_hook', label: 'Improve hook' },
    { value: 'structure', label: 'Improve structure' },
    { value: 'grammar', label: 'Fix grammar' },
    { value: 'custom', label: 'Custom instruction' },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const content = formData.get('content') as string
    const instruction = formData.get('instruction') as string

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, instruction }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Rewrite failed')
      }
      
      setResult(data.content)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Rewrite Content</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content to rewrite</label>
            <textarea
              name="content"
              required
              rows={6}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Paste your content here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">How should I rewrite it?</label>
            <textarea
              name="instruction"
              rows={2}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="e.g., Make it more engaging for LinkedIn, or: Make it 50% shorter"
            />
          </div>

          {error && (
            <Card className="p-3 bg-destructive/10 border-destructive">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              'Rewrite Content'
            )}
          </Button>
        </form>

        {result && (
          <Card className="mt-6 p-4">
            <h2 className="font-semibold mb-2">Rewritten Content</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">Copy</Button>
              <Button size="sm" variant="outline">Save to Library</Button>
              <Button size="sm" variant="outline">Rewrite Again</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}