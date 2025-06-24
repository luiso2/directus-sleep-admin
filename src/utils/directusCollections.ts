// Utilidad para listar las colecciones de Directus
const API_URL = import.meta.env.VITE_DIRECTUS_URL;
const API_TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN;

export async function getDirectusCollections() {
  try {
    const response = await fetch(`${API_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filtrar solo las colecciones personalizadas (no las del sistema)
    const customCollections = data.data.filter((collection: any) => 
      !collection.collection.startsWith('directus_') && 
      collection.collection !== 'spatial_ref_sys'
    );

    return customCollections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

// Función para obtener los campos de una colección
export async function getCollectionFields(collection: string) {
  try {
    const response = await fetch(`${API_URL}/fields/${collection}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching fields for ${collection}:`, error);
    return [];
  }
}
