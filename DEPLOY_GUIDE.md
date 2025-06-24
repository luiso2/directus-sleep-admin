# 🚀 Guía de Deploy a Vercel - Sleep Plus Admin

## Pasos para hacer deploy en Vercel:

### 1. Instalar dependencias localmente

```bash
cd "C:\Users\Andybeats\Desktop\Claude Projects\vargas\directus-admin-sleep"
npm install
```

### 2. Probar localmente

```bash
npm run dev
```

Verificar que funciona en http://localhost:5173

### 3. Build de producción

```bash
npm run build
```

### 4. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 5. Login en Vercel

```bash
vercel login
```

### 6. Deploy

```bash
vercel --prod
```

Durante el deploy, Vercel preguntará:
- Set up and deploy? **Y**
- Which scope? **[Tu cuenta]**
- Link to existing project? **N**
- Project name? **sleep-plus-admin**
- Directory? **./dist**
- Override settings? **N**

### 7. Configurar Variables de Entorno

1. Ir a https://vercel.com/dashboard
2. Seleccionar el proyecto `sleep-plus-admin`
3. Ir a Settings → Environment Variables
4. Agregar:

```
VITE_DIRECTUS_URL = https://admin-api-directus.dqyvuv.easypanel.host
VITE_DIRECTUS_TOKEN = mcp_414xdh4vq47mcao0jg2
```

5. Click en "Save"

### 8. Re-deploy con las variables

```bash
vercel --prod
```

## 🔍 Verificación

1. Abrir la URL proporcionada por Vercel
2. Probar login con:
   - Admin: lbencomo94@gmail.com
   - Manager: ana.martinez@sleepplus.com
   - Agent: carlos.rodriguez@sleepplus.com
   - Password: password123

3. Verificar que cada rol ve su dashboard correspondiente

## 🐛 Troubleshooting

### Error de CORS
Si hay problemas de CORS en producción:
1. Verificar que Directus permite el dominio de Vercel
2. Agregar el dominio en la configuración de CORS de Directus

### Error de autenticación
1. Verificar que el token está configurado correctamente
2. Probar el token directamente con:
```bash
curl -H "Authorization: Bearer mcp_414xdh4vq47mcao0jg2" https://admin-api-directus.dqyvuv.easypanel.host/users/me
```

### Build falla
1. Verificar que no hay errores de TypeScript
2. Ejecutar `npm run build` localmente primero

## 📝 Próximos Pasos

Una vez confirmado que funciona:
1. Personalizar el dominio en Vercel
2. Implementar las funcionalidades específicas del negocio
3. Agregar más páginas según los roles