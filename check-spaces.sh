#!/bin/bash

echo "🔍 Verificando variables de entorno..."
echo ""

# Verificar .env
if [ -f .env ]; then
    echo "📄 Archivo .env:"
    grep VITE_DIRECTUS_URL .env | sed 's/$/[END]/' | cat -A
    echo ""
fi

# Verificar .env.production
if [ -f .env.production ]; then
    echo "📄 Archivo .env.production:"
    grep VITE_DIRECTUS_URL .env.production | sed 's/$/[END]/' | cat -A
    echo ""
fi

# Verificar vercel.json
if [ -f vercel.json ]; then
    echo "📄 Archivo vercel.json:"
    grep -A 1 VITE_DIRECTUS_URL vercel.json
    echo ""
fi

echo "✅ Si ves espacios antes de [END], ese es el problema!"
echo ""
echo "🔧 Los archivos han sido actualizados para usar .trim() automáticamente"
echo "   - api/directus/[[...path]].js"
echo "   - src/providers/directus/dataProvider.ts"
echo "   - src/services/directus.ts"
