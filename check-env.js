// Script para verificar las variables de entorno
console.log('VITE_DIRECTUS_URL:', process.env.VITE_DIRECTUS_URL);
console.log('VITE_DIRECTUS_URL length:', process.env.VITE_DIRECTUS_URL?.length);
console.log('VITE_DIRECTUS_URL trimmed:', process.env.VITE_DIRECTUS_URL?.trim());
console.log('Has trailing space:', process.env.VITE_DIRECTUS_URL !== process.env.VITE_DIRECTUS_URL?.trim());
