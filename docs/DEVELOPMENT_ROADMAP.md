# 📋 DOCUMENTACIÓN COMPLETA DE LA API - SLEEP PLUS ADMIN

## 🎯 RESUMEN EJECUTIVO

✅ **Estado actual**: Directus tiene **34 colecciones personalizadas** perfectamente estructuradas
✅ **Sistema de usuarios**: Completamente implementado (list, create, edit, show)
✅ **Autenticación**: Funcionando correctamente  
✅ **Data Provider**: Configurado para Directus con proxy API

## 🗄️ COLECCIONES PRINCIPALES IDENTIFICADAS

### 📊 Negocio Principal
- **customers** (16 campos) - Gestión de clientes
- **sales** (13 campos) - Registro de ventas
- **calls** (15 campos) - Gestión de llamadas
- **employees** (13 campos) - Gestión de empleados
- **products** (11 campos) - Catálogo de productos
- **appointments** (16 campos) - Sistema de citas
- **campaigns** (14 campos) - Campañas de marketing
- **commissions** (8 campos) - Sistema de comisiones

### 🏪 Gestión de Tiendas
- **stores** (12 campos) - Gestión de tiendas físicas
- **evaluations** (17 campos) - Evaluaciones de colchones

### 🎮 Gamificación
- **achievements** (11 campos) - Sistema de logros
- **scripts** (12 campos) - Scripts de ventas

### 🔗 Integraciones
- **shopify_products**, **shopify_customers**, **shopify_settings** - Integración Shopify
- **stripe_config**, **payment_links** - Integración Stripe  
- **webhooks**, **webhook_events** - Sistema de webhooks

### 🔧 Sistema
- **activity_logs** (9 campos) - Auditoría del sistema
- **permissions**, **user_permission_overrides** - Control de acceso
- **system_settings** (8 campos) - Configuración global

## 🛠️ SIGUIENTE PLAN DE DESARROLLO

### ✅ YA COMPLETADO
1. **Usuarios**: Sistema completo (list, create, edit, show)
2. **Dashboard básico**: Funcionando
3. **Autenticación**: Implementada

### 🚧 PRIORIDAD ALTA (Próximos pasos)

#### 1. Clientes (customers)
```bash
# Crear páginas faltantes
src/pages/customers/
├── list.tsx     ❌ CREAR
├── create.tsx   ❌ CREAR  
├── edit.tsx     ❌ CREAR
├── show.tsx     ❌ CREAR
└── index.tsx    ❌ CREAR
```

#### 2. Productos (products)
```bash
src/pages/products/
├── list.tsx     ❌ CREAR
├── create.tsx   ❌ CREAR
├── edit.tsx     ❌ CREAR
├── show.tsx     ❌ CREAR
└── index.tsx    ❌ CREAR
```

#### 3. Ventas (sales)
```bash
src/pages/sales/
├── list.tsx     ❌ CREAR
├── create.tsx   ❌ CREAR
├── edit.tsx     ❌ CREAR
├── show.tsx     ❌ CREAR
└── index.tsx    ❌ CREAR
```

#### 4. Llamadas/Tareas (calls)
```bash
src/pages/calls/
├── list.tsx     ❌ CREAR
├── create.tsx   ❌ CREAR
├── edit.tsx     ❌ CREAR
├── show.tsx     ❌ CREAR
└── index.tsx    ❌ CREAR
```

### 🎯 PRIORIDAD MEDIA

#### 5. Citas (appointments)
#### 6. Campañas (campaigns)  
#### 7. Empleados (employees)
#### 8. Tiendas (stores)

### 🔄 PRIORIDAD BAJA
#### 9. Integraciones (Shopify, Stripe)
#### 10. Sistema de logros (achievements)
#### 11. Scripts de ventas (scripts)

## 📋 CAMPOS PRINCIPALES POR COLECCIÓN

### customers (16 campos)
```typescript
interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  type?: string;
  vip?: boolean;
  credit_limit?: number;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}
```

### sales (13 campos)
```typescript
interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  sale_date?: Date;
  status?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
  payment_method?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}
```

### calls (15 campos)
```typescript
interface Call {
  id: string;
  customer_id?: string;
  user_id?: string;
  type: string;
  status: string;
  disposition?: string;
  duration?: number;
  start_time?: Date;
  end_time?: Date;
  notes?: string;
  script?: any;
  objections?: any;
  next_action?: any;
  metadata?: any;
  created_at?: Date;
}
```

### products (11 campos)
```typescript
interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  stock?: number;
  category?: string;
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
```

## 🎯 CONFIGURACIÓN URGENTE NECESARIA

### 1. Actualizar resourceMap en dataProvider
```typescript
// src/providers/directus/dataProvider.ts
const resourceMap: Record<string, string> = {
  users: "directus_users",
  roles: "directus_roles",
  customers: "customers",           // ✅ AGREGAR
  products: "products",            // ✅ AGREGAR  
  sales: "sales",                  // ✅ AGREGAR
  calls: "calls",                  // ✅ AGREGAR
  tasks: "calls",                  // Alias para llamadas
  campaigns: "campaigns",          // ✅ AGREGAR
  teams: "stores",                 // Usar stores como teams
  stores: "stores",               // ✅ AGREGAR
  appointments: "appointments",    // ✅ AGREGAR
  // ... más mappings
};
```

### 2. Crear tipos TypeScript centralizados
```typescript
// src/types/directus.ts - CREAR ESTE ARCHIVO
export interface Customer { /* ... */ }
export interface Sale { /* ... */ }
export interface Call { /* ... */ }
export interface Product { /* ... */ }
// ... todos los tipos
```

### 3. Actualizar rutas en App.tsx
```typescript
// Verificar que las rutas están bien configuradas para:
- customers ✅ (definida)
- sales ✅ (definida)  
- products ✅ (definida)
- calls/tasks ✅ (definida como tasks)
- campaigns ✅ (definida)
```

## 🚀 COMANDOS PARA DESARROLLO RÁPIDO

```bash
# 1. Instalar dependencias si faltan
npm install

# 2. Ejecutar en desarrollo
npm run dev

# 3. Generar páginas automáticamente (próximo paso)
node scripts/generate-refine-pages.js

# 4. Build para producción
npm run build

# 5. Deploy a Vercel
npx vercel --prod
```

## 🎯 OBJETIVO INMEDIATO

**CREAR LAS 4 PÁGINAS PRIORITARIAS:**
1. ✅ Usuarios (COMPLETADO)
2. 🚧 Clientes (customers) - SIGUIENTE
3. 🚧 Productos (products) - SIGUIENTE  
4. 🚧 Ventas (sales) - SIGUIENTE
5. 🚧 Llamadas (calls) - SIGUIENTE

Una vez completadas estas 4 entidades principales, el sistema tendrá la funcionalidad básica completa para operar.
