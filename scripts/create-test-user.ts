import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'test123', // En producción, esto debería estar hasheado
        name: 'Usuario de Prueba',
        role: 'USER'
      }
    })
    console.log('Usuario de prueba creado:', user)
  } catch (error) {
    console.error('Error al crear el usuario:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 