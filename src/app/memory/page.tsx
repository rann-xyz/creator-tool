'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Edit, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const memorySchema = z.object({
  category: z.string().min(1),
  content: z.string().min(1),
  label: z.string().optional(),
})

type MemoryFormData = z.infer<typeof memorySchema>

type Memory = {
  id: string
  category: string
  content: string
  label?: string
  createdAt: string
}

export default function MemoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
  })

  if (!session) {
    router.push('/login')
    return null
  }

  // Load memories
  const loadMemories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/memory')
      const data = await res.json()
      setMemories(data)
    } catch (e) {
      setError('Failed to load memories')
    }
    setLoading(false)
  }

  // Create/Update memory
  const onSubmit = async (data: MemoryFormData) => {
    setLoading(true)
    setError(null)
    
    try {
      const url = editing ? `/api/memory/${editing.id}` : '/api/memory'
      const method = editing ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to save')
      
      await loadMemories()
      setShowForm(false)
      setEditing(null)
      reset()
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  // Delete memory
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return
    
    setLoading(true)
    try {
      await fetch(`/api/memory/${id}`, { method: 'DELETE' })
      await loadMemories()
    } catch {
      setError('Failed to delete memory')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Creator Memory</h1>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Add Memory
          </Button>
        </div>

        {error && (
          <Card className="p-3 mb-4 bg-destructive/10 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {loading && memories.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-secondary">Loading memories...</p>
          </div>
        ) : memories.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-secondary mb-4">No memories saved yet.</p>
            <p className="text-sm">Memories help personalize your content generation.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {memories.map(memory => (
              <Card key={memory.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{memory.category}</h3>
                    <p className="text-sm text-secondary">{memory.content}</p>
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(memory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditing(memory)
                      setShowForm(true)
                      reset(memory)
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(memory.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {editing ? 'Edit Memory' : 'Add Memory'}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input {...register('category')} placeholder="e.g., tone, writing style" />
                  {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    {...register('content')}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Describe your preference..."
                  />
                  {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Label (optional)</label>
                  <Input {...register('label')} placeholder="e.g., Professional Tone" />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}