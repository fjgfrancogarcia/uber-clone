const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Verificar la conexión
    await prisma.$connect()
    console.log('Conexión exitosa a la base de datos')

    // Verificar las tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('\nTablas creadas:')
    tables.forEach(table => console.log(table.table_name))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 