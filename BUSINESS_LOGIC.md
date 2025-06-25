# 🏢 Sleep Plus - Sistema de Gestión de Tareas para Call Center

## 📊 Descripción del Negocio

Sleep Plus es un call center que vende productos para mejorar el sueño (colchones, almohadas, suplementos). El sistema NO es para hacer llamadas, sino para **gestionar las tareas diarias** de los agentes y hacer seguimiento del rendimiento.

### 🎯 Flujo de Trabajo Real:

1. **Asignación Diaria**: Cada mañana, los agentes reciben una lista de clientes a contactar
2. **Llamadas Externas**: Los agentes usan teléfonos físicos o softphones externos
3. **Registro de Resultados**: Después de cada llamada, registran el resultado en el sistema
4. **Seguimiento**: Programan callbacks y actualizan el estado del cliente
5. **Cierre de Ventas**: Registran ventas completadas con detalles del producto

## 👥 Roles y Responsabilidades

### 1. 🔴 Administrador (Admin)
**Función**: Configuración del sistema y supervisión general

**Panel Principal**:
- **Métricas Globales**:
  - Total de ventas del mes/día
  - Tasa de conversión general
  - Productos más vendidos
  - Rendimiento por tienda/ubicación
  
**Secciones Disponibles**:
- 📊 **Dashboard Ejecutivo**: KPIs generales de la empresa
- 👥 **Gestión de Usuarios**: Alta/baja de empleados y asignación de roles
- 🏪 **Configuración de Tiendas**: Gestión de ubicaciones y metas
- 📦 **Catálogo de Productos**: Gestión de productos y precios
- ⚙️ **Configuración del Sistema**:
  - Metas diarias por agente
  - Horarios de operación
  - Scripts de venta aprobados
  - Configuración de comisiones

### 2. 🟡 Gerente (Manager)
**Función**: Supervisión del equipo y asignación de tareas

**Panel Principal**:
- **Vista del Equipo en Tiempo Real**:
  - Estado actual de cada agente (Disponible/En break/Offline)
  - Progreso del día (15/25 llamadas completadas)
  - Ventas del equipo en tiempo real
  - Alertas de agentes con bajo rendimiento

**Secciones Disponibles**:
- 📋 **Asignación de Tareas**:
  - Distribuir lista de clientes del día
  - Reasignar clientes entre agentes
  - Priorizar clientes VIP o callbacks urgentes
  
- 📈 **Monitoreo del Equipo**:
  - Tablero en vivo con el estado de cada agente
  - Número de llamadas realizadas vs meta
  - Tasa de conversión por agente
  - Tiempo promedio por llamada
  
- 📝 **Gestión de Campañas**:
  - Crear campañas para productos específicos
  - Asignar scripts a campañas
  - Definir metas de campaña
  
- 🎯 **Reportes**:
  - Rendimiento diario/semanal/mensual
  - Ranking de agentes
  - Análisis de productos vendidos
  - Razones de rechazo más comunes

### 3. 🟢 Agente (Agent)
**Función**: Ejecutar tareas de venta y actualizar resultados

**Panel Principal - Mi Día**:
```
┌─────────────────────────────────────────┐
│  Mi Meta Hoy: 25 llamadas | 3 ventas   │
│  Progreso: ████████░░░░░ 15/25 (60%)   │
│  Ventas: ██░░░░░░░░░░░░ 1/3            │
└─────────────────────────────────────────┘
```

**Secciones Disponibles**:

- 📞 **Mi Lista de Hoy**:
  - Lista ordenada de clientes a contactar
  - Información del cliente (nombre, historial, preferencias)
  - Botón "Marcar como Llamado" con resultado
  - Estados: Pendiente / No contesta / Interesado / Vendido / Rechazado
  
- ✅ **Registro Rápido**:
  - Formulario post-llamada:
    - ¿Contestó? Sí/No
    - Si contestó: ¿Resultado?
      - Venta realizada → Capturar productos y monto
      - Callback → Programar fecha y hora
      - No interesado → Razón
    - Notas de la conversación
  
- 📊 **Mi Rendimiento**:
  - Estadísticas personales del día/semana/mes
  - Ranking en el equipo
  - Comisiones ganadas
  - Histórico de ventas
  
- 📚 **Recursos**:
  - Scripts de venta actuales
  - Información de productos
  - Preguntas frecuentes
  - Tips de venta

## 🔄 Flujos de Trabajo Principales

### Flujo Diario del Agente:
1. **9:00 AM - Inicio de Sesión**
   - Ve su lista de 25-30 clientes asignados
   - Revisa callbacks programados para hoy
   
2. **9:15 AM - Comienza Llamadas**
   - Selecciona primer cliente
   - Revisa historial y notas previas
   - Realiza llamada (fuera del sistema)
   - Registra resultado inmediatamente
   
3. **Durante el Día**
   - Actualiza estado después de cada llamada
   - Toma breaks (marca estado como "En break")
   - Consulta scripts si necesita ayuda
   
4. **5:00 PM - Cierre**
   - Completa últimas actualizaciones
   - Revisa su rendimiento del día
   - Programa callbacks para mañana

### Flujo del Manager:
1. **8:30 AM - Preparación**
   - Revisa clientes disponibles para hoy
   - Distribuye equitativamente entre agentes
   - Prioriza callbacks y clientes VIP
   
2. **Durante el Día**
   - Monitorea tablero en tiempo real
   - Reasigna clientes si un agente falta
   - Apoya a agentes con bajo rendimiento
   - Revisa y aprueba ventas grandes
   
3. **6:00 PM - Reporte**
   - Genera reporte del día
   - Identifica áreas de mejora
   - Planifica estrategia para mañana

## 📱 Características Clave del Sistema

### 1. **Sistema de Estados en Tiempo Real**
- 🟢 Disponible
- 🔵 En llamada (manual)
- 🟡 En break
- 🔴 Offline

### 2. **Gamificación**
- 🏆 Ranking diario/semanal/mensual
- 🎯 Badges por logros (Primera venta del día, 100% contactados, etc.)
- 💰 Visualización de comisiones en tiempo real

### 3. **Automatizaciones**:
- Distribución automática de clientes según performance
- Recordatorios de callbacks
- Alertas cuando un agente está muy debajo de su meta

### 4. **Integraciones Futuras**:
- Shopify: Sincronizar inventario y procesar órdenes
- Stripe: Procesar pagos
- WhatsApp Business: Enviar confirmaciones

## 🎨 UI/UX Consideraciones

### Para Agentes:
- **Interfaz simple y enfocada**: Solo lo necesario para su trabajo
- **Acciones rápidas**: Máximo 2 clics para registrar resultado
- **Mobile-friendly**: Muchos usan tablets
- **Modo oscuro**: Para reducir fatiga visual

### Para Managers:
- **Dashboards visuales**: Gráficos en tiempo real
- **Alertas prominentes**: Cuando algo requiere atención
- **Filtros rápidos**: Por agente, campaña, producto

### Para Admins:
- **Vistas consolidadas**: Toda la operación de un vistazo
- **Configuración clara**: Cambios que afectan a todos deben ser obvios

## 🔐 Seguridad y Privacidad

- Los agentes solo ven datos de sus clientes asignados
- Los managers ven todos los clientes de su equipo
- Información sensible (tarjetas de crédito) nunca se almacena
- Logs de todas las acciones para auditoría

## 📈 KPIs Principales

1. **Para Agentes**:
   - Llamadas realizadas / Meta diaria
   - Tasa de contacto (contestaron / total)
   - Tasa de conversión (ventas / contactados)
   - Ticket promedio de venta

2. **Para Managers**:
   - Cumplimiento de meta del equipo
   - Agentes activos vs programados
   - Ventas por hora
   - Productos más vendidos del día

3. **Para Admins**:
   - Revenue diario/mensual
   - Costo por venta
   - Lifetime value por cliente
   - Rendimiento por ubicación/tienda