import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-secondary mb-6">Please login</p>
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
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-4">
          <Link href="/settings/providers">
            <Button variant="ghost" className="w-full justify-between">
              AI Providers
            </Link>
          </Link>
          
          <Link href="/memory">
            <Button variant="ghost" className="w-full justify-between">
              Creator Memory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}