// Script para verificar y corregir permisos de Directus
const axios = require('axios');

const DIRECTUS_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const DIRECTUS_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

async function checkPermissions() {
  try {
    console.log('Verificando permisos del token...\n');

    const headers = {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    // Verificar acceso a las colecciones problemáticas
    const collections = ['evaluations', 'new_customers', 'directus_users'];
    
    for (const collection of collections) {
      try {
        const response = await axios.get(`${DIRECTUS_URL}/items/${collection}?limit=1`, { headers });
        console.log(`✅ ${collection}: Acceso permitido`);
      } catch (error) {
        console.log(`❌ ${collection}: ${error.response?.status} - ${error.response?.statusText || error.message}`);
      }
    }

    // Verificar información del token
    try {
      const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, { headers });
      console.log('\nInformación del usuario/token:', userResponse.data.data);
    } catch (error) {
      console.log('\n❌ No se pudo obtener información del token:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

checkPermissions();
