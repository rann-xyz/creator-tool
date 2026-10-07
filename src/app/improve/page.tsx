'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function ImprovePage() {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session.data) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const content = formData.get('content') as string

    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Improvement failed')
      }
      
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Improve Content</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Content to improve</label>
            <textarea
              name="content"
              required
              rows={6}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Paste your content here..."
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
                Improving...
              </>
            ) : (
              'Improve Content'
            )}
          </Button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <Card className="p-4">
              <h2 className="font-semibold mb-2">Overall Assessment</h2>
              <p className="text-sm">{result.analysis?.overall || 'Analysis pending'}</p>
            </Card>
            
            <Card className="p-4">
              <h2 className="font-semibold mb-2">Improved Version</h2>
              <pre className="whitespace-pre-wrap text-sm">{result.content}</pre>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">Copy</Button>
                <Button size="sm" variant="outline">Save to Library</Button>
                <Button size="sm" variant="outline">Improve Again</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}