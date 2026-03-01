

## Plan: Alta masiva de 53 usuarios con asignación visual de roles

### Objetivo
Crear una pantalla temporal (o modal) con los 53 usuarios ya cargados, donde puedas asignar el rol a cada uno mediante un dropdown, y luego crearlos todos de golpe usando la Edge Function `create-user` existente.

### Cambios

**1. Nuevo componente: `src/components/users/UserBulkPreloaded.tsx`**
- Tabla con los 53 usuarios pre-cargados (nombre, apellido, email)
- Columna con dropdown de rol (`partner`, `area_manager`, `senior`, `junior`, `finance`) para cada fila
- Botones de asignación rápida: "Todos junior", "Todos senior", etc.
- Checkbox para seleccionar/deseleccionar usuarios individuales
- Botón "Crear usuarios seleccionados" que llama secuencialmente a `create-user` (con pausa de 500ms entre cada uno, como el bulk actual)
- Barra de progreso durante la creación
- Al finalizar: resumen con credenciales descargables (mismo flujo que `UserBulkCreation`)

**2. Integración en la página de Usuarios (`/system-users`)**
- Añadir un botón "Alta equipo NRRO" (o similar) que abre el nuevo componente
- Una vez creados todos, el botón desaparece o se desactiva

### Datos pre-cargados
Los 53 usuarios de la lista Microsoft 365 con sus campos: `email`, `first_name`, `last_name`. El campo `role` empezará vacío para que lo asignes tú.

### Flujo de uso
1. Vas a Usuarios y pulsas "Alta equipo NRRO"
2. Se abre un modal/dialog con la tabla de 53 usuarios
3. Asignas rol a cada uno (o usas los botones de asignación rápida)
4. Pulsas "Crear usuarios"
5. Se procesan secuencialmente (barra de progreso visible)
6. Al terminar, descargas el CSV de credenciales

### Detalles tecnicos
- Reutiliza la Edge Function `create-user` existente (sin cambios)
- Delay de 500ms entre creaciones para evitar rate-limiting
- Los usuarios sin rol asignado no se crean (validacion)
- Mismo sistema de credenciales temporales (`user_credentials_temp`)
