'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function CreatePage() {
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session.data) {
    router.push('/login')
    return null
  }

  const formats = [
    { value: 'x_post', label: 'X Post' },
    { value: 'x_thread', label: 'X Thread' },
    { value: 'linkedin_post', label: 'LinkedIn Post' },
    { value: 'instagram_caption', label: 'Instagram Caption' },
    { value: 'tiktok_script', label: 'TikTok Script' },
    { value: 'email', label: 'Email' },
    { value: 'newsletter', label: 'Newsletter' },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const prompt = formData.get('prompt') as string
    const format = formData.get('format') as string

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, format }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
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
        <h1 className="text-2xl font-bold mb-6">Create Content</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">What do you want to create?</label>
            <textarea
              name="prompt"
              required
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="e.g., Write a post about why AI agents are becoming useful for developers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Format</label>
            <select name="format" className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary">
              {formats.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
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
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        </form>

        {result && (
          <Card className="mt-6 p-4">
            <h2 className="font-semibold mb-2">Generated Content</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline">Copy</Button>
              <Button size="sm" variant="outline">Save to Library</Button>
              <Button size="sm" variant="outline">Regenerate</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}