import { PrismaClient } from '@prisma/client'

declare global {
  // Allow global `var` for Prisma in Vercel serverless
  var prisma: PrismaClient | undefined
}

// Prevent multiple Prisma instances in development
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}