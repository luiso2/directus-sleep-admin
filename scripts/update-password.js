#!/usr/bin/env node

// Script para actualizar la contraseña de un usuario en Directus
const { createDirectus, rest, authentication, readUsers, updateUser, staticToken } = require('@directus/sdk');

// Configuración
const DIRECTUS_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

async function updateUserPassword(email, newPassword) {
  try {
    console.log(`🔐 Actualizando contraseña para usuario: ${email}`);
    
    // Crear cliente de Directus con token estático
    const client = createDirectus(DIRECTUS_URL)
      .with(staticToken(DIRECTUS_TOKEN))
      .with(rest());
    
    // Primero, obtener el ID del usuario
    const users = await client.request(
      readUsers({
        filter: {
          email: {
            _eq: email
          }
        },
        limit: 1
      })
    );
    
    if (!users || users.length === 0) {
      throw new Error(`Usuario no encontrado: ${email}`);
    }
    
    const userId = users[0].id;
    console.log(`✅ Usuario encontrado con ID: ${userId}`);
    
    // Actualizar la contraseña
    // Directus automáticamente hasheará la contraseña
    const updatedUser = await client.request(
      updateUser(userId, {
        password: newPassword
      })
    );
    
    console.log(`✅ Contraseña actualizada exitosamente para ${email}`);
    return updatedUser;
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error.message);
    throw error;
  }
}

// Si se ejecuta directamente desde la línea de comandos
if (require.main === module) {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.log('Uso: node update-password.js <email> <nueva_contraseña>');
    console.log('Ejemplo: node update-password.js lbencomo94@gmail.com Atec2019chino');
    process.exit(1);
  }
  
  updateUserPassword(email, password)
    .then(() => {
      console.log('✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { updateUserPassword };
