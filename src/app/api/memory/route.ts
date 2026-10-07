import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const memorySchema = z.object({
  category: z.string().min(1),
  content: z.string().min(1),
  label: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const memories = await prisma.styleExample.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(memories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = memorySchema.parse(body)

    const memory = await prisma.styleExample.create({
      data: {
        userId: session.user.id,
        category: data.category,
        content: data.content,
        label: data.label,
      },
    })

    return NextResponse.json(memory, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to create memory' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const data = memorySchema.parse(body)

    const memory = await prisma.styleExample.updateMany({
      where: { id, userId: session.user.id },
      data,
    })

    if (memory.count === 0) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to update memory' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
  }

  await prisma.styleExample.deleteMany({
    where: { id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}