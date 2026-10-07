'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Edit, Check, X } from 'lucide-react'
import { z } from 'zod'

const providerSchema = z.object({
  name: z.string().min(1),
  protocol: z.string().min(1),
  baseUrl: z.string().url().optional(),
  model: z.string().min(1),
  apiKey: z.string().min(1),
})

type Provider = {
  id: string
  name: string
  protocol: string
  baseUrl?: string
  model?: string
  isActive: boolean
  isDefault: boolean
  status: string
}

export default function SettingsProvidersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  if (!session) {
    router.push('/login')
    return null
  }

  // Load providers
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/providers')
      const data = await res.json()
      setProviders(data)
    } catch {
      setError('Failed to load providers')
    }
    setLoading(false)
  }

  // Test provider
  const handleTest = async (providerId: string) => {
    setTestingId(providerId)
    try {
      const provider = providers.find(p => p.id === providerId)
      if (!provider) return

      const res = await fetch('/api/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      }
    } catch (e) {
      // Error handling
    }
    setTestingId(null)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI Providers</h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>

        {error && (
          <Card className="p-3 mb-4 bg-destructive/10 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-secondary">Loading providers...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map(provider => (
              <Card key={provider.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-secondary">
                      {provider.protocol} • {provider.model}
                    </p>
                    {provider.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {provider.isActive ? (
                      <Button size="sm" variant="outline" onClick={() => handleTest(provider.id)}>
                        {testingId === provider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-secondary">Inactive</span>
                    )}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {providers.length === 0 && !loading && (
          <Card className="p-6 text-center">
            <p className="text-secondary mb-4">No providers configured.</p>
            <p className="text-sm">Add a provider to start creating content.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

import { Plus } from 'lucide-react'