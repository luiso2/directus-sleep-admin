#!/usr/bin/env node

// Script para explorar las colecciones de Directus y generar documentación
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const API_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

// Función helper para hacer requests a Directus
async function directusRequest(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

async function exploreDirectus() {
  console.log('🔍 Explorando Directus API...\n');
  
  // 1. Obtener todas las colecciones
  console.log('📚 Obteniendo colecciones...');
  const collections = await directusRequest('/collections');
  
  if (!collections) {
    console.error('❌ No se pudieron obtener las colecciones');
    return;
  }

  // Filtrar colecciones personalizadas
  const customCollections = collections.data.filter(col => 
    !col.collection.startsWith('directus_') && 
    col.collection !== 'spatial_ref_sys'
  );
  
  console.log(`✅ Encontradas ${customCollections.length} colecciones personalizadas:\n`);
  
  const apiDoc = {
    title: 'Sleep Plus Admin - API Documentation',
    version: '1.0.0',
    description: 'Documentación de la API de Directus para Sleep Plus Admin',
    baseUrl: API_URL,
    collections: {}
  };
  
  // 2. Para cada colección, obtener campos y algunos datos de ejemplo
  for (const collection of customCollections) {
    const collectionName = collection.collection;
    console.log(`📊 Analizando colección: ${collectionName}`);
    
    // Obtener campos
    const fields = await directusRequest(`/fields/${collectionName}`);
    if (!fields) continue;
    
    // Obtener algunos registros de ejemplo (máximo 3)
    const items = await directusRequest(`/items/${collectionName}?limit=3`);
    
    apiDoc.collections[collectionName] = {
      meta: collection.meta || {},
      fields: fields.data || [],
      sampleData: items ? items.data : [],
      endpoints: {
        list: `GET /items/${collectionName}`,
        get: `GET /items/${collectionName}/:id`,
        create: `POST /items/${collectionName}`,
        update: `PATCH /items/${collectionName}/:id`,
        delete: `DELETE /items/${collectionName}/:id`
      }
    };
    
    console.log(`  - ${fields.data?.length || 0} campos`);
    console.log(`  - ${items?.data?.length || 0} registros de ejemplo`);
  }
  
  // 3. Obtener información de los usuarios del sistema
  console.log('\n👥 Analizando usuarios del sistema...');
  const users = await directusRequest('/users?limit=10');
  if (users) {
    console.log(`  - ${users.data.length} usuarios encontrados`);
    
    // Agregar información de usuarios a la documentación
    apiDoc.systemCollections = {
      directus_users: {
        endpoint: '/users',
        description: 'Usuarios del sistema',
        sampleCount: users.data.length,
        roles: [...new Set(users.data.map(u => u.role).filter(Boolean))]
      }
    };
  }
  
  // 4. Obtener roles
  console.log('\n🔐 Analizando roles...');
  const roles = await directusRequest('/roles');
  if (roles) {
    console.log(`  - ${roles.data.length} roles encontrados`);
    
    apiDoc.systemCollections.directus_roles = {
      endpoint: '/roles',
      description: 'Roles del sistema',
      sampleCount: roles.data.length,
      rolesList: roles.data.map(r => ({ id: r.id, name: r.name }))
    };
  }
  
  // 5. Guardar documentación
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const docPath = path.join(docsDir, 'directus-api-documentation.json');
  fs.writeFileSync(docPath, JSON.stringify(apiDoc, null, 2));
  
  // 6. Crear documentación en Markdown
  const markdownDoc = generateMarkdownDoc(apiDoc);
  const mdPath = path.join(docsDir, 'API_DOCUMENTATION.md');
  fs.writeFileSync(mdPath, markdownDoc);
  
  console.log('\n✅ Documentación generada:');
  console.log(`  - JSON: ${docPath}`);
  console.log(`  - Markdown: ${mdPath}`);
  
  return apiDoc;
}

function generateMarkdownDoc(apiDoc) {
  let md = `# ${apiDoc.title}\n\n`;
  md += `**Versión:** ${apiDoc.version}\n`;
  md += `**Descripción:** ${apiDoc.description}\n`;
  md += `**Base URL:** ${apiDoc.baseUrl}\n\n`;
  
  md += `## 📊 Resumen\n\n`;
  md += `- **Colecciones personalizadas:** ${Object.keys(apiDoc.collections).length}\n`;
  md += `- **Colecciones del sistema:** ${Object.keys(apiDoc.systemCollections || {}).length}\n\n`;
  
  md += `## 🗄️ Colecciones Personalizadas\n\n`;
  
  for (const [collectionName, collection] of Object.entries(apiDoc.collections)) {
    md += `### ${collectionName}\n\n`;
    md += `${collection.meta.note || 'Sin descripción'}\n\n`;
    
    md += `**Endpoints:**\n`;
    for (const [action, endpoint] of Object.entries(collection.endpoints)) {
      md += `- ${endpoint}\n`;
    }
    md += `\n`;
    
    md += `**Campos (${collection.fields.length}):**\n`;
    collection.fields.forEach(field => {
      md += `- \`${field.field}\` (${field.type})`;
      if (field.meta?.required) md += ` *requerido*`;
      if (field.meta?.note) md += ` - ${field.meta.note}`;
      md += `\n`;
    });
    md += `\n`;
    
    if (collection.sampleData.length > 0) {
      md += `**Datos de ejemplo:**\n`;
      md += `\`\`\`json\n${JSON.stringify(collection.sampleData[0], null, 2)}\n\`\`\`\n\n`;
    }
  }
  
  md += `## 👥 Colecciones del Sistema\n\n`;
  
  if (apiDoc.systemCollections) {
    for (const [collection, info] of Object.entries(apiDoc.systemCollections)) {
      md += `### ${collection}\n\n`;
      md += `**Endpoint:** ${info.endpoint}\n`;
      md += `**Descripción:** ${info.description}\n`;
      md += `**Registros:** ${info.sampleCount}\n\n`;
    }
  }
  
  return md;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  exploreDirectus().catch(console.error);
}

module.exports = { exploreDirectus, directusRequest };
