# Credenciales de Acceso - Sleep+ Admin

## Usuarios Disponibles

### Administrador
- **Email**: lbencomo94@gmail.com
- **Contraseña**: admin123
- **Rol**: Administrator (acceso completo)

### Manager
- **Email**: ana.martinez@sleepplus.com
- **Contraseña**: (necesita ser configurada en Directus)
- **Rol**: Manager

### Agente
- **Email**: carlos.rodriguez@sleepplus.com
- **Contraseña**: (necesita ser configurada en Directus)
- **Rol**: Agent

### Otros Administradores
- **Email**: info@vargasmmi.com
- **Contraseña**: (necesita ser configurada en Directus)
- **Rol**: Administrator

## Notas Importantes

1. **Solo el usuario lbencomo94@gmail.com tiene la contraseña configurada** actualmente.
2. Para configurar las contraseñas de los otros usuarios, accede a Directus en: https://admin-api-directus.dqyvuv.easypanel.host
3. Los tokens mock han sido eliminados - ahora se requiere autenticación real con Directus.

## Problemas Resueltos

✅ Eliminada la autenticación con tokens mock
✅ El sistema ahora solo acepta usuarios reales de Directus
✅ Configurada la contraseña para el usuario administrador principal

## Pendiente

⚠️ Configurar CORS en el servidor de Directus para permitir peticiones desde https://directus-admin-sleep.vercel.app
