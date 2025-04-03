// Script para resetear la contraseña de un usuario
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Instanciar el cliente Prisma
const prisma = new PrismaClient();

// Email del usuario al que resetear la contraseña
const targetEmail = 'fjgfrancojg@gmail.com';
// Nueva contraseña
const newPassword = 'qwer1234';

async function resetPassword() {
  try {
    console.log(`Intentando resetear contraseña para: ${targetEmail}`);
    
    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: {
        email: targetEmail
      }
    });

    if (!user) {
      console.error('Usuario no encontrado.');
      return;
    }

    console.log('Usuario encontrado:', user.id);

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Nueva contraseña hasheada:', hashedPassword);

    // Actualizar la contraseña del usuario
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password: hashedPassword
      }
    });

    console.log('Contraseña actualizada exitosamente');
    console.log('Usuario actualizado:', {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error al resetear la contraseña:', error);
  } finally {
    // Cerrar la conexión con Prisma
    await prisma.$disconnect();
  }
}

// Ejecutar la función
resetPassword(); 