# Sleep+ Admin - Próximos Pasos

## ✅ Completado

1. **Estructura del Proyecto**
   - Configuración de TypeScript y Vite
   - Integración con Directus SDK
   - Sistema de rutas con React Router
   - Layout principal con Ant Design

2. **Páginas Implementadas**
   - Dashboard con estadísticas
   - Evaluaciones Trade-In (completo)
   - Configuración de Stripe

3. **Servicios**
   - Servicio de Directus con DataProvider
   - Configuración de credenciales

## 📋 Por Hacer

### 1. Páginas Faltantes
- [ ] **CustomerList.tsx** - Lista y gestión de clientes
- [ ] **SubscriptionList.tsx** - Gestión de suscripciones
- [ ] **ShopifyConfiguration.tsx** - Configuración de Shopify

### 2. Integraciones

#### Stripe
- [ ] Implementar webhook handler (`/api/stripe/webhook`)
- [ ] Sincronización de suscripciones
- [ ] Procesamiento de pagos
- [ ] Gestión de cancelaciones

#### Shopify
- [ ] Configuración de API
- [ ] Sincronización de productos
- [ ] Gestión de cupones Trade-In
- [ ] Webhook para órdenes

### 3. Funcionalidades Adicionales
- [ ] Sistema de autenticación con Directus
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Logs de actividad

### 4. Testing
- [ ] Tests unitarios para servicios
- [ ] Tests de integración
- [ ] Tests E2E con Playwright

### 5. Despliegue
- [ ] Configurar variables de entorno en Vercel
- [ ] Configurar dominio personalizado
- [ ] SSL y seguridad
- [ ] CI/CD con GitHub Actions

## 🔧 Configuración Pendiente

### Variables de Entorno en Vercel:
```
VITE_DIRECTUS_URL=https://admin-api-directus.dqyvuv.easypanel.host
VITE_DIRECTUS_TOKEN=mcp_414xdh4vq47mcao0jg2
VITE_STRIPE_PUBLIC_KEY=[Pendiente]
VITE_SHOPIFY_DOMAIN=[Pendiente]
VITE_SHOPIFY_ACCESS_TOKEN=[Pendiente]
```

### Webhooks a Configurar:
1. **Stripe Webhook**: `https://directus-admin-sleep.vercel.app/api/stripe/webhook`
2. **Shopify Webhook**: `https://directus-admin-sleep.vercel.app/api/shopify/webhook`

## 📝 Notas Importantes

- Asegurarse de que todas las tablas en Directus tengan los permisos correctos
- Configurar CORS en Directus para permitir peticiones desde Vercel
- Implementar rate limiting para las APIs
- Agregar monitoreo con Sentry o similar
