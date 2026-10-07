import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { type ProviderConfig, createProviderAdapter } from '@/lib/providers/adapter'
import { decryptCredential } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { providerId } = await req.json()

  // Verify provider belongs to user
  const provider = await prisma.provider.findFirst({
    where: {
      id: providerId,
      userId: session.user.id,
    },
  })

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  try {
    const decryptedKey = decryptCredential(provider.apiKey)
    const config: ProviderConfig = {
      id: provider.id,
      name: provider.name,
      protocol: provider.protocol,
      baseUrl: provider.baseUrl!,
      apiKey: decryptedKey,
      model: provider.model!,
    }

    const adapter = createProviderAdapter(config)
    const isValid = await adapter.validateCredentials()

    return NextResponse.json({
      success: isValid,
      providerId: provider.id,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message ?? 'Connection test failed',
    }, { status: 401 })
  }
}