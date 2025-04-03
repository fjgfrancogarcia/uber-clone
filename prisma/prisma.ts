import { PrismaClient } from '@prisma/client'

// Esta configuración previene múltiples instancias de Prisma Client en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Solo asigna prisma al objeto global en desarrollo
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Gestión adicional para entornos serverless
if (process.env.NODE_ENV === 'production') {
  // En producción, solo registramos información básica para depuración
  console.log('Prisma Client inicializado en modo producción')
} 