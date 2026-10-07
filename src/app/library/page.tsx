'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LibraryPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Library</h1>
          <p className="text-secondary mb-6">Please login to access your library</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Library</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Button className="w-full justify-start">Content</Button>
          <Button variant="outline" className="w-full justify-start">Ideas</Button>
          <Button variant="outline" className="w-full justify-start">Research</Button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Saved Items</h2>
          <div className="bg-surface border border-border rounded-lg p-6 text-center text-secondary">
            No items saved yet.
          </div>
        </div>
      </div>
    </div>
  )
}