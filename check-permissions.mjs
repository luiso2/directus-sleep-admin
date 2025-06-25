// Script para verificar y corregir permisos de Directus
import axios from 'axios';

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
        if (error.response?.data) {
          console.log(`   Detalles:`, error.response.data);
        }
      }
    }

    // Verificar información del token
    try {
      const userResponse = await axios.get(`${DIRECTUS_URL}/users/me`, { headers });
      console.log('\nInformación del usuario/token:', userResponse.data.data);
    } catch (error) {
      console.log('\n❌ No se pudo obtener información del token:', error.response?.status, error.response?.data || error.message);
    }

    // Verificar el rol y permisos
    try {
      const rolesResponse = await axios.get(`${DIRECTUS_URL}/roles`, { headers });
      console.log('\nRoles disponibles:', rolesResponse.data.data);
    } catch (error) {
      console.log('\n❌ No se pudo obtener roles:', error.response?.status);
    }

  } catch (error) {
    console.error('Error general:', error.message);
  }
}

checkPermissions();
