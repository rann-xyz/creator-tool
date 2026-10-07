import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Search, Filter } from 'lucide-react'

export default function IdeasPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Ideas</h1>
          <p className="text-secondary mb-6">Please login to access ideas</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ideas</h1>
          <Link href="/ideas/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Idea
            </Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="text-center py-8 text-secondary">
            <p>No ideas yet. Create your first idea to get started.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}