import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptCredential } from '@/lib/crypto'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name } = signupSchema.parse(body)

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim(),
        passwordHash,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return new Response(JSON.stringify(user), { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues[0].message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: 'Failed to create account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}