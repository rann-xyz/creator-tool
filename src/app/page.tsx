import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Creator Engine
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          One Interface for Creating, Researching, and Repurposing Content
        </h1>
        <p className="text-lg text-secondary mb-12 max-w-3xl mx-auto">
          Connect your own AI provider. Create posts, research topics, generate ideas, 
          rewrite and improve content—all powered by the models you trust.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-surface rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Create Content</h3>
            <p className="text-sm text-secondary">Generate posts, threads, and articles for any platform</p>
          </div>
          <div className="p-6 bg-surface rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Research</h3>
            <p className="text-sm text-secondary">Get real information with verified sources</p>
          </div>
          <div className="p-6 bg-surface rounded-lg border border-border">
            <h3 className="font-semibold mb-2">BYOK Security</h3>
            <p className="text-sm text-secondary">Your API keys stay encrypted, never exposed</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Get Started Free
            </Button>
          </Link>
          <p className="mt-4 text-sm text-secondary">
            No credit card required • Connect your own AI provider
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-24">
        <div className="container mx-auto px-4 text-center text-sm text-secondary">
          Creator Engine — AI content creation platform
        </div>
      </footer>
    </div>
  )
}