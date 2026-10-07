import Link from 'next/link'

export default function README() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border p-4">
        <Link href="/" className="text-2xl font-bold text-primary">Creator Engine</Link>
      </header>
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Creator Engine</h1>
        <p className="text-lg mb-4">One simple interface for creating, researching, improving, rewriting, and repurposing content, powered by whatever AI provider you connect.</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Start</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Set DATABASE_URL and AUTH_SECRET in your environment</li>
          <li>Run <code className="bg-surface px-2 py-1 rounded">npx prisma db push</code></li>
          <li>Run <code className="bg-surface px-2 py-1 rounded">npm run dev</code></li>
          <li>Deploy to Vercel with environment variables</li>
        </ol>
      </main>
    </div>
  )
}