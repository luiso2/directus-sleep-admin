# Guía de Configuración de Credenciales - Sleep+ Admin

Esta guía te ayudará a configurar las credenciales necesarias para integrar Stripe y Shopify con el sistema Sleep+ Admin.

## 📋 Requisitos Previos

- Cuenta de Stripe (con acceso al dashboard)
- Cuenta de Shopify Admin API
- Acceso al panel de administración Sleep+ Admin

## 🔐 Configuración de Stripe

### 1. Obtener las API Keys

1. Accede a tu [Dashboard de Stripe](https://dashboard.stripe.com)
2. Ve a **Developers** → **API Keys**
3. Copia las siguientes claves:
   - **Test API Key**: `sk_test_...`
   - **Live API Key**: `sk_live_...` (solo cuando estés listo para producción)

### 2. Configurar Webhooks

1. En el Dashboard de Stripe, ve a **Developers** → **Webhooks**
2. Haz clic en **Add endpoint**
3. Configura el endpoint:
   ```
   Endpoint URL: https://directus-admin-sleep.vercel.app/api/stripe/webhook
   ```
4. Selecciona los siguientes eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Guarda el **Webhook Secret** (`whsec_...`)

### 3. Crear Payment Links

Para cada plan de suscripción (Basic, Premium, Elite):

1. Ve a **Products** → **Payment Links**
2. Crea un nuevo Payment Link
3. Configura:
   - **Producto**: Sleep+ [Plan]
   - **Precio**: $25 (Basic) / $50 (Premium) / $75 (Elite)
   - **Tipo**: Recurrente mensual
4. Guarda el ID del Payment Link y la URL

### 4. Configurar en el Sistema

1. Accede a Sleep+ Admin
2. Ve a **Integraciones** → **Stripe**
3. Ingresa:
   - API Keys (test/live)
   - Webhook Secrets
   - Payment Links para cada plan

## 🛍️ Configuración de Shopify

### 1. Crear una App Privada

1. Accede a tu Admin de Shopify
2. Ve a **Settings** → **Apps and sales channels**
3. Haz clic en **Develop apps**
4. Crea una nueva app con los siguientes permisos:
   - `read_products, write_products`
   - `read_customers, write_customers`
   - `read_price_rules, write_price_rules`
   - `read_discounts, write_discounts`
   - `read_orders`

### 2. Obtener el Access Token

1. En la configuración de tu app privada
2. Ve a **API credentials**
3. Genera y copia el **Admin API access token**

### 3. Configurar Webhooks de Shopify

1. En tu app privada, ve a **Webhooks**
2. Configura las siguientes notificaciones:
   ```
   URL base: https://directus-admin-sleep.vercel.app/api/shopify/webhook
   ```
3. Eventos requeridos:
   - `products/create`
   - `products/update`
   - `customers/create`
   - `customers/update`
   - `orders/create`
   - `orders/updated`

### 4. Configurar en el Sistema

1. Accede a Sleep+ Admin
2. Ve a **Integraciones** → **Shopify**
3. Ingresa:
   - Dominio de la tienda: `tu-tienda.myshopify.com`
   - Access Token
   - Webhook Secret (si configuraste verificación)

## 🔄 Configuración de Sincronización

### 1. Primera Sincronización

Después de configurar las credenciales:

1. Ve a **Integraciones** → **Sincronización**
2. Haz clic en **Sincronización Completa**
3. Esto importará:
   - Productos de Shopify
   - Clientes existentes
   - Configuración inicial

### 2. Sincronización Automática

1. En la página de Sincronización
2. Activa **Sincronización Automática**
3. Selecciona el intervalo (recomendado: cada hora)

## 🧪 Pruebas de Integración

### Test de Stripe

1. Usa tarjetas de prueba:
   - Exitosa: `4242 4242 4242 4242`
   - Falla: `4000 0000 0000 9995`
2. Crea una suscripción de prueba
3. Verifica que aparezca en el sistema

### Test de Shopify

1. Crea un producto de prueba en Shopify
2. Ejecuta una sincronización manual
3. Verifica que aparezca en Sleep+ Admin

### Test de Trade-In

1. Crea una evaluación Trade-In
2. Apruébala
3. Verifica que se genere el cupón en Shopify

## ⚠️ Consideraciones de Seguridad

- **Nunca** compartas las API Keys en código público
- Usa siempre el modo Test hasta estar listo para producción
- Rota las claves regularmente
- Configura alertas de uso anormal en ambas plataformas

## 🚨 Solución de Problemas

### Error de Autenticación Stripe
- Verifica que las API Keys sean correctas
- Asegúrate de usar el modo correcto (test/live)

### Webhooks no llegan
- Verifica la URL del endpoint
- Revisa los logs en Stripe/Shopify
- Confirma que el servidor esté accesible

### Sincronización falla
- Revisa los permisos de la API
- Verifica límites de rate en las APIs
- Consulta el historial de sincronización

## 📞 Soporte

Si necesitas ayuda adicional:
- Email: soporte@sleepplus.com
- Documentación API Stripe: https://stripe.com/docs/api
- Documentación API Shopify: https://shopify.dev/api/admin

---

**Nota**: Mantén este documento actualizado con cualquier cambio en las configuraciones o URLs.
