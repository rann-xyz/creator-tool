'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-secondary mb-6">Please login to access your dashboard</p>
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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/create">
            <Button className="w-full">Create Content</Button>
          </Link>
          <Link href="/ideas">
            <Button variant="outline" className="w-full">Generate Ideas</Button>
          </Link>
          <Link href="/research">
            <Button variant="outline" className="w-full">Research</Button>
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="ghost" className="justify-start">
              <Plus className="mr-2 h-4 w-4" />
              New Generation
            </Button>
            <Button variant="ghost" className="justify-start">
              <Search className="mr-2 h-4 w-4" />
              Browse Library
            </Button>
            <Button variant="ghost" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Manage Providers
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Plus, Search, Filter } from 'lucide-react'