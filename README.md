# Sleep+ Admin - Sistema de Gestión con Directus

Sistema de administración para Sleep+ Elite con integración de Stripe y Shopify, usando Directus como backend headless CMS.

## 🚀 Características

- **Gestión de Clientes**: Administración completa de clientes y sus datos
- **Suscripciones**: Control de planes Starter, Premium y Elite
- **Trade-In Program**: Evaluación de colchones usados y generación de cupones
- **Integraciones**:
  - **Stripe**: Procesamiento de pagos y suscripciones
  - **Shopify**: Gestión de productos y cupones
- **Dashboard**: Visualización de métricas y estadísticas en tiempo real

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Ant Design + Refine
- **Backend**: Directus (Headless CMS)
- **Base de Datos**: PostgreSQL
- **Hosting**: Vercel

## 📋 Requisitos Previos

- Node.js >= 18
- npm o yarn
- Acceso a las credenciales de Directus

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/luiso2/directus-sleep-admin.git
cd directus-admin-sleep
```

2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura las variables de entorno con tus credenciales.

## 🚀 Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## 📦 Build

Para construir el proyecto para producción:

```bash
npm run build
```

## 🌐 Despliegue

El proyecto está configurado para desplegarse automáticamente en Vercel.

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas de la aplicación
│   ├── dashboard/      # Dashboard principal
│   ├── customers/      # Gestión de clientes
│   ├── subscriptions/  # Gestión de suscripciones
│   ├── evaluations/    # Trade-In evaluations
│   ├── stripe/         # Configuración de Stripe
│   └── shopify/        # Configuración de Shopify
├── services/           # Servicios y APIs
├── types/              # Tipos TypeScript
└── utils/              # Utilidades

```

## 🔐 Seguridad

- Las credenciales están almacenadas en variables de entorno
- La autenticación se maneja a través de Directus
- Todas las comunicaciones son por HTTPS

## 📝 Licencia

Proyecto privado - Todos los derechos reservados
