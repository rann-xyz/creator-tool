import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ user: null })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email ?? '' },
    select: { email: true, name: true, image: true },
  })

  return Response.json({ user })
}