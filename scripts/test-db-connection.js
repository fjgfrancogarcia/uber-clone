// Script de prueba de conexión a base de datos
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Iniciando prueba de conexión a la base de datos...');
  const dbUrl = process.env.DATABASE_URL;
  console.log('URL de conexión:', dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':****@') : 'No definida'); // Ocultar contraseña
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['error', 'warn', 'info']
  });

  try {
    console.log('Intentando conectar a la base de datos...');
    // Ejecutar una consulta simple
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('¡Conexión exitosa!', result);
    
    // Intentar contar usuarios
    const userCount = await prisma.user.count();
    console.log(`Número de usuarios en la base de datos: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('Error al conectar:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función de prueba
testConnection()
  .then(success => {
    console.log(success ? 'Prueba completada con éxito' : 'La prueba falló');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  }); 