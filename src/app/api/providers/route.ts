import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptCredential } from '@/lib/crypto'
import { type ProviderConfig, createProviderAdapter, ProviderProtocol } from '@/lib/providers/adapter'
import { z } from 'zod'

const providerSchema = z.object({
  name: z.string().min(1),
  protocol: z.nativeEnum(ProviderProtocol),
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  model: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = providerSchema.parse(body)

    // Test connection
    const tempConfig: ProviderConfig = {
      id: 'temp',
      name: data.name,
      protocol: data.protocol,
      baseUrl: data.baseUrl,
      apiKey: data.apiKey,
      model: data.model,
    }

    const adapter = createProviderAdapter(tempConfig)
    const isValid = await adapter.validateCredentials()

    if (!isValid) {
      return Response.json({ error: 'Connection failed: Invalid credentials' }, { status: 401 })
    }

    // Save encrypted
    const provider = await prisma.provider.create({
      data: {
        userId: session.user.id,
        name: data.name,
        protocol: data.protocol,
        baseUrl: data.baseUrl,
        apiKey: encryptCredential(data.apiKey),
        model: data.model,
      },
    })

    // Set as default only if this is first provider
    if ((await prisma.provider.count({ where: { userId: session.user.id } })) === 1) {
      await prisma.provider.update({
        where: { id: provider.id },
        data: { isDefault: true },
      })
    }

    return Response.json(provider)
  } catch (error: any) {
    return Response.json({ error: error.message ?? 'Failed to add provider' }, { status: 400 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const providers = await prisma.provider.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      protocol: true,
      baseUrl: true,
      model: true,
      isActive: true,
      isDefault: true,
      status: true,
    },
  })

  return Response.json(providers)
}