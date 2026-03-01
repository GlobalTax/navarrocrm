

## Plan: Mostrar nivel de permisos en la tabla de usuarios

### Objetivo
Agregar una columna "Permisos" en las tablas de usuarios (general y sistema) que muestre el nombre del grupo de permisos asignado a cada usuario (ej. "Administrador", "Solo Lectura", "Operativo"), o un indicador "Sin asignar" si no tiene grupo.

### Cambios

**1. Crear hook `useUserPermissionGroupNames`**

Nuevo archivo: `src/hooks/useUserPermissionGroupNames.ts`

Un hook que consulta `user_permission_groups` con join a `permission_groups` para obtener un mapa `{ [user_id]: nombre_grupo }`. Se usa con `useQuery` filtrando por `org_id`.

Consulta:
```
supabase
  .from('user_permission_groups')
  .select('user_id, permission_groups(name)')
  .eq('org_id', user.org_id)
```

Devuelve: `Map<string, string>` (userId -> groupName)

---

**2. Actualizar `UserTable.tsx`**

- Recibir nueva prop `permissionGroupMap: Record<string, string>`
- Agregar columna "Permisos" entre "Rol" y "Estado"
- Mostrar un Badge con el nombre del grupo o "Sin asignar" en gris

---

**3. Actualizar `SystemUserTable.tsx`**

- Mismo cambio: nueva prop y columna "Permisos"

---

**4. Actualizar `Users.tsx` (pagina general)**

- Importar y usar `useUserPermissionGroupNames`
- Pasar el mapa como prop a `UserTable`

---

**5. Actualizar `SystemUsersPage.tsx`**

- Importar y usar `useUserPermissionGroupNames`
- Pasar el mapa como prop a `SystemUserTable`

---

### Diseno visual de la columna

| Permisos |
|----------|
| Badge azul claro: "Administrador" |
| Badge gris: "Sin asignar" |
| Badge verde claro: "Operativo" |

Los badges seguiran el sistema de diseno: `border-[0.5px] rounded-[10px] text-xs`.

### Archivos afectados

| Archivo | Accion |
|---------|--------|
| `src/hooks/useUserPermissionGroupNames.ts` | Nuevo |
| `src/components/users/UserTable.tsx` | Agregar columna Permisos |
| `src/components/users/SystemUserTable.tsx` | Agregar columna Permisos |
| `src/pages/Users.tsx` | Usar hook y pasar prop |
| `src/pages/SystemUsersPage.tsx` | Usar hook y pasar prop |

No se requieren cambios en base de datos. Las tablas `permission_groups` y `user_permission_groups` ya existen.
