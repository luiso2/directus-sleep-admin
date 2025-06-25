// Script TypeScript para explorar Directus y generar tipos
import { directusDataProvider } from '../src/providers/directus/dataProvider';

const API_URL = 'https://admin-api-directus.dqyvuv.easypanel.host';
const API_TOKEN = 'mcp_414xdh4vq47mcao0jg2';

interface DirectusCollection {
  collection: string;
  meta?: {
    note?: string;
    hidden?: boolean;
    singleton?: boolean;
  };
}

interface DirectusField {
  field: string;
  type: string;
  meta?: {
    required?: boolean;
    note?: string;
    interface?: string;
    special?: string[];
    options?: any;
  };
  schema?: {
    data_type?: string;
    is_nullable?: boolean;
    default_value?: any;
  };
}

// Función para hacer requests a Directus
async function directusRequest(endpoint: string): Promise<any> {
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
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

// Mapeo de tipos Directus a TypeScript
function mapDirectusTypeToTS(field: DirectusField): string {
  const directusType = field.type;
  const schemaType = field.schema?.data_type;
  
  switch (directusType) {
    case 'integer':
    case 'bigInteger':
    case 'float':
    case 'decimal':
      return 'number';
    case 'string':
    case 'text':
    case 'uuid':
    case 'hash':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'dateTime':
    case 'date':
    case 'time':
    case 'timestamp':
      return 'Date | string';
    case 'json':
      return 'any';
    case 'csv':
      return 'string[]';
    case 'alias':
      return 'any';
    default:
      // Para relaciones
      if (field.meta?.special?.includes('m2o')) {
        return 'string | object'; // ID o objeto relacionado
      }
      if (field.meta?.special?.includes('o2m')) {
        return 'string[] | object[]'; // Array de IDs o objetos
      }
      if (field.meta?.special?.includes('m2m')) {
        return 'string[] | object[]'; // Array de IDs o objetos
      }
      return 'any';
  }
}

// Generar interface TypeScript para una colección
function generateTypeScriptInterface(collectionName: string, fields: DirectusField[]): string {
  const interfaceName = toPascalCase(collectionName);
  
  let tsInterface = `export interface ${interfaceName} {\n`;
  
  fields.forEach(field => {
    const fieldName = field.field;
    const tsType = mapDirectusTypeToTS(field);
    const isOptional = !field.meta?.required || field.schema?.is_nullable;
    const optionalMark = isOptional ? '?' : '';
    
    // Agregar comentario si existe
    if (field.meta?.note) {
      tsInterface += `  /** ${field.meta.note} */\n`;
    }
    
    tsInterface += `  ${fieldName}${optionalMark}: ${tsType};\n`;
  });
  
  tsInterface += '}\n\n';
  
  return tsInterface;
}

// Convertir string a PascalCase
function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Generar configuración de Refine para una colección
function generateRefineResource(collectionName: string, fields: DirectusField[]): string {
  const resourceName = collectionName;
  const routeName = collectionName.replace(/_/g, '-');
  
  // Determinar campos para mostrar en la lista
  const displayFields = fields
    .filter(f => !f.meta?.hidden && !['id', 'date_created', 'date_updated'].includes(f.field))
    .slice(0, 5)
    .map(f => f.field);
  
  const config = `{
  name: "${resourceName}",
  list: "/${routeName}",
  create: "/${routeName}/create",
  edit: "/${routeName}/edit/:id",
  show: "/${routeName}/show/:id",
  meta: {
    canDelete: true,
    label: "${toPascalCase(collectionName)}"
  }
}`;

  return config;
}

// Explorar todas las colecciones
export async function exploreDirectusCollections() {
  console.log('🔍 Explorando colecciones de Directus...\n');
  
  // 1. Obtener colecciones
  const collectionsResponse = await directusRequest('/collections');
  if (!collectionsResponse) return null;
  
  const collections: DirectusCollection[] = collectionsResponse.data;
  
  // Filtrar colecciones personalizadas
  const customCollections = collections.filter(col => 
    !col.collection.startsWith('directus_') && 
    col.collection !== 'spatial_ref_sys' &&
    !col.meta?.hidden
  );
  
  console.log(`✅ Encontradas ${customCollections.length} colecciones personalizadas:`);
  customCollections.forEach(col => {
    console.log(`- ${col.collection}: ${col.meta?.note || 'Sin descripción'}`);
  });
  
  const documentation = {
    collections: {} as any,
    typescript: '',
    refineResources: [] as string[],
    summary: {
      totalCollections: customCollections.length,
      generatedAt: new Date().toISOString()
    }
  };
  
  let allTypesDefinitions = `// Tipos generados automáticamente para Sleep Plus Admin\n`;
  allTypesDefinitions += `// Generado el: ${new Date().toLocaleDateString()}\n\n`;
  
  // 2. Procesar cada colección
  for (const collection of customCollections) {
    const collectionName = collection.collection;
    console.log(`\n📊 Procesando: ${collectionName}`);
    
    // Obtener campos
    const fieldsResponse = await directusRequest(`/fields/${collectionName}`);
    if (!fieldsResponse) continue;
    
    const fields: DirectusField[] = fieldsResponse.data;
    
    // Obtener datos de ejemplo
    const itemsResponse = await directusRequest(`/items/${collectionName}?limit=2`);
    const sampleData = itemsResponse?.data || [];
    
    // Generar TypeScript interface
    const tsInterface = generateTypeScriptInterface(collectionName, fields);
    allTypesDefinitions += tsInterface;
    
    // Generar configuración de Refine
    const refineResource = generateRefineResource(collectionName, fields);
    
    documentation.collections[collectionName] = {
      meta: collection.meta,
      fields: fields.map(f => ({
        name: f.field,
        type: f.type,
        required: f.meta?.required || false,
        note: f.meta?.note,
        interface: f.meta?.interface,
        tsType: mapDirectusTypeToTS(f)
      })),
      sampleData,
      typescript: tsInterface,
      refineResource,
      endpoints: {
        list: `GET /items/${collectionName}`,
        get: `GET /items/${collectionName}/:id`,
        create: `POST /items/${collectionName}`,
        update: `PATCH /items/${collectionName}/:id`,
        delete: `DELETE /items/${collectionName}/:id`
      }
    };
    
    documentation.refineResources.push(refineResource);
    
    console.log(`  ✓ ${fields.length} campos procesados`);
    console.log(`  ✓ ${sampleData.length} registros de ejemplo`);
  }
  
  documentation.typescript = allTypesDefinitions;
  
  return documentation;
}

// Verificar qué páginas están implementadas
export function checkImplementedPages(): string[] {
  const pagesDir = '../src/pages';
  const implementedPages: string[] = [];
  
  // Esta función necesitaría ser ejecutada en el contexto del proyecto
  // Por ahora, retornamos las páginas que sabemos que existen
  return [
    'dashboard',
    'login', 
    'settings',
    'users'
  ];
}

// Generar archivo de rutas para Refine
export function generateRefineRoutes(collections: string[]): string {
  let routes = `// Rutas generadas automáticamente para Refine\n`;
  routes += `// Generado el: ${new Date().toLocaleDateString()}\n\n`;
  routes += `export const resources = [\n`;
  
  collections.forEach(collection => {
    const routeName = collection.replace(/_/g, '-');
    routes += `  {\n`;
    routes += `    name: "${collection}",\n`;
    routes += `    list: "/${routeName}",\n`;
    routes += `    create: "/${routeName}/create",\n`;
    routes += `    edit: "/${routeName}/edit/:id",\n`;
    routes += `    show: "/${routeName}/show/:id",\n`;
    routes += `    meta: {\n`;
    routes += `      canDelete: true,\n`;
    routes += `      label: "${toPascalCase(collection)}"\n`;
    routes += `    }\n`;
    routes += `  },\n`;
  });
  
  routes += `];\n`;
  return routes;
}

// Ejecutar exploración si es llamado directamente
if (typeof window === 'undefined') {
  exploreDirectusCollections().then(doc => {
    if (doc) {
      console.log('\n📝 Documentación generada exitosamente');
      console.log('🎯 Próximos pasos:');
      console.log('1. Revisar los tipos TypeScript generados');
      console.log('2. Crear las páginas faltantes de Refine');
      console.log('3. Configurar las rutas en App.tsx');
    }
  }).catch(console.error);
}
