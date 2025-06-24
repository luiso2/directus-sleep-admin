# Sleep Plus Admin Panel

Sistema de gestión de tareas para el call center Sleep Plus, construido con Refine y Directus.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

### Build para Producción

```bash
npm run build
```

## 📋 Credenciales de Prueba

### Administrador
- Email: lbencomo94@gmail.com
- Password: password123

### Manager
- Email: ana.martinez@sleepplus.com
- Password: password123

### Agente
- Email: carlos.rodriguez@sleepplus.com
- Password: password123

## 🌐 Deploy en Vercel

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Login en Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

### 4. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, agregar:

- `VITE_DIRECTUS_URL`: https://admin-api-directus.dqyvuv.easypanel.host
- `VITE_DIRECTUS_TOKEN`: [Tu token de API]

## 🔧 Tecnologías

- **Frontend**: React + TypeScript
- **UI Framework**: Ant Design
- **Admin Framework**: Refine
- **Backend**: Directus
- **Hosting**: Vercel

## 📁 Estructura del Proyecto

```
src/
├── providers/        # Auth y data providers
├── pages/           # Páginas de la aplicación
│   ├── login/       # Página de login
│   └── dashboard/   # Dashboard por rol
├── components/      # Componentes reutilizables
└── App.tsx         # Componente principal
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo al sistema
- Configuración global
- Gestión de usuarios

### Manager
- Gestión del equipo
- Asignación de tareas
- Reportes

### Agent
- Vista de tareas personales
- Registro de llamadas y ventas
- Métricas individuales

## 📝 Notas

- El sistema usa Directus como backend
- La autenticación es manejada por Directus
- Los permisos están configurados en Directus por rol