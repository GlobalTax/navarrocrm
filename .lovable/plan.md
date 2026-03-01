

## Parametrizar tipos de actividad en el registro de tiempo

### Situacion actual
- La tabla `activity_types` ya existe en la BD con campos: `id`, `name`, `category`, `color`, `icon`, `is_active`
- El timer (`ModernTimer.tsx`) tiene los tipos hardcodeados: "Facturable", "Admin. Oficina", "Desarrollo Negocio", "Interno"
- El campo `entry_type` en `time_entries` es un `string` libre (no un enum en BD), lo cual facilita la migracion

### Plan

**1. Crear hook `useActivityTypes`**
- Nuevo archivo `src/hooks/useActivityTypes.ts`
- Query a la tabla `activity_types` filtrando `is_active = true`
- Cache con React Query
- Incluir mutaciones para crear/editar/desactivar tipos (para la pantalla de gestion)

**2. Crear pantalla de gestion de tipos de actividad**
- Nuevo archivo `src/components/settings/ActivityTypesManager.tsx`
- Tabla con las columnas: Nombre, Categoria, Color, Estado (activo/inactivo)
- Acciones: crear nuevo, editar, desactivar (no borrar para mantener integridad)
- Integrar en la seccion de Configuracion existente o como sub-tab en Time Tracking

**3. Actualizar el timer para usar tipos dinamicos**
- En `ModernTimer.tsx`, reemplazar el `Select` hardcodeado de "Tipo de actividad" por uno que cargue desde `useActivityTypes`
- Al guardar, almacenar el `name` del tipo en `entry_type` (o mejor aun, el `id` en un nuevo campo)
- Mantener compatibilidad: si no hay tipos configurados, mostrar los 4 por defecto

**4. Actualizar la tabla de entradas**
- En `OptimizedTimeEntriesTable.tsx`, si se muestra el tipo, usar el nombre del activity_type en lugar del valor hardcodeado

### Migracion de datos
- No se necesita migracion de esquema: `entry_type` ya es `string` libre
- Sembrar los 4 tipos por defecto en `activity_types` si la tabla esta vacia (via migracion SQL)

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useActivityTypes.ts` | Nuevo - hook CRUD para activity_types |
| `src/components/settings/ActivityTypesManager.tsx` | Nuevo - UI para gestionar tipos |
| `src/components/time-tracking/ModernTimer.tsx` | Cargar tipos dinamicamente del hook |
| `src/components/recurring-fees/QuickTimeEntry.tsx` | Anadir selector de tipo si procede |

### Migracion SQL
- INSERT de los 4 tipos por defecto (billable, office_admin, business_development, internal) si no existen, para que el sistema funcione desde el primer momento

