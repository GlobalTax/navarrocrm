

## Plan: Asignacion masiva de permisos a usuarios

### Objetivo
Permitir seleccionar multiples usuarios en la tabla de "Usuarios del Sistema" y asignarles un grupo de permisos a todos de una vez, en lugar de ir uno por uno.

### Cambios

#### 1. Agregar checkboxes de seleccion en `SystemUserTable.tsx`
- Anadir una columna de checkbox al inicio de cada fila
- Checkbox en la cabecera para "seleccionar todos"
- Barra de acciones flotante cuando hay usuarios seleccionados (similar al patron de `TasksList.tsx`)
- Boton "Asignar permisos" que abre un modal

#### 2. Crear componente `BulkPermissionAssignDialog.tsx`
- Modal que muestra:
  - Cuantos usuarios estan seleccionados
  - Selector de grupo de permisos (reutilizando los grupos existentes de `permission_groups`)
  - Boton "Aplicar a X usuarios"
  - Barra de progreso durante la ejecucion
- Usa el hook `usePermissionGroups` existente para listar los grupos disponibles

#### 3. Anadir mutacion masiva en `usePermissionGroups.ts`
- Nueva mutacion `applyGroupToMultipleUsers` que recibe `{ userIds: string[], groupId: string }`
- Itera sobre cada usuario llamando la logica existente de `applyGroupToUser` (insertar permisos + registrar en `user_permission_groups`)
- Muestra progreso y resumen al finalizar

#### 4. Conectar en la pagina de System Users
- Pasar las props de seleccion y el callback de asignacion masiva desde la pagina padre al `SystemUserTable`

### Archivos

| Archivo | Accion |
|---------|--------|
| `src/components/users/SystemUserTable.tsx` | Modificar: anadir checkboxes y barra de acciones |
| `src/components/users/BulkPermissionAssignDialog.tsx` | Crear: modal de asignacion masiva |
| `src/hooks/usePermissionGroups.ts` | Modificar: anadir mutacion `applyGroupToMultipleUsers` |
| Pagina padre (donde se usa SystemUserTable) | Modificar: gestionar estado de seleccion |

### Flujo del usuario
1. Marca checkboxes en la tabla de usuarios
2. Aparece barra: "X usuarios seleccionados" + boton "Asignar permisos"
3. Click en "Asignar permisos" abre modal
4. Selecciona un grupo de permisos del dropdown
5. Click "Aplicar" → se asignan permisos a todos los seleccionados
6. Toast de confirmacion + se limpia la seleccion
