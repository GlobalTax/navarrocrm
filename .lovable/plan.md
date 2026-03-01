

## Crear Grupos de Permisos

### Problema actual
Para asignar permisos a un usuario hay que ir modulo por modulo, permiso por permiso. Con 8 modulos y 4 niveles, configurar un usuario completo requiere hasta 32 clics.

### Solucion
Crear **Grupos de Permisos** (plantillas predefinidas) que agrupan multiples permisos. Al asignar un grupo a un usuario, se aplican todos los permisos del grupo de una vez.

### Modelo de datos

**Nueva tabla: `permission_groups`**
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid PK | Identificador |
| org_id | uuid FK | Organizacion |
| name | varchar | Nombre del grupo (ej: "Lectura basica", "Gestor de expedientes") |
| description | text | Descripcion del grupo |
| is_system | boolean | Si es plantilla del sistema (no editable) |
| created_by | uuid | Quien lo creo |
| created_at / updated_at | timestamptz | Timestamps |

**Nueva tabla: `permission_group_items`**
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid PK | Identificador |
| group_id | uuid FK | Referencia al grupo |
| module | varchar | Modulo (cases, contacts, etc.) |
| permission | varchar | Nivel (read, write, delete, admin) |

**Nueva tabla: `user_permission_groups`**
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid PK | Identificador |
| user_id | uuid | Usuario |
| group_id | uuid FK | Grupo asignado |
| org_id | uuid | Organizacion |
| assigned_by | uuid | Quien asigno |
| created_at | timestamptz | Timestamp |

RLS en las 3 tablas por `org_id`, solo partners/area_managers pueden gestionar.

### Plantillas predefinidas (seed)
Se insertaran grupos por defecto al crear la migracion:
- **Solo Lectura**: read en todos los modulos
- **Operativo**: read + write en cases, contacts, time_tracking, proposals
- **Gestor de Area**: read + write + delete en cases, contacts, proposals, time_tracking, reports
- **Administrador**: admin en todos los modulos
- **Finanzas**: admin en billing, read en reports, cases, contacts

### Cambios en el frontend

**1. Nueva pestana "Grupos de Permisos" en la pagina de Usuarios del Sistema**
- Anadir una pestana `Tabs` en `SystemUsersPage.tsx` con dos secciones: "Usuarios" (actual) y "Grupos de Permisos"
- La pestana de grupos mostrara una tabla con los grupos existentes y un boton para crear nuevos

**2. Nuevo componente `PermissionGroupsTab.tsx`**
- Tabla inline con columnas: Nombre, Descripcion, Permisos (badges), Acciones
- Boton "Crear Grupo" que abre un dialog
- Acciones: editar, eliminar, ver usuarios asignados

**3. Nuevo componente `PermissionGroupDialog.tsx`**
- Formulario para crear/editar un grupo
- Campo nombre y descripcion
- Matriz de checkboxes: modulos (filas) x niveles (columnas) para seleccionar permisos
- Boton guardar

**4. Actualizar `UserPermissionsDialog.tsx`**
- Anadir seccion superior "Asignar Grupo" con un Select de grupos disponibles
- Al seleccionar un grupo, se aplican automaticamente todos los permisos del grupo (INSERT masivo en `user_permissions`)
- Mantener la seccion actual de permisos individuales como "ajuste fino"

**5. Nuevo hook `usePermissionGroups.ts`**
- Query para listar grupos con sus items
- Mutations: crear grupo, editar grupo, eliminar grupo
- Mutation: asignar grupo a usuario (inserta todos los permisos del grupo en `user_permissions`)

### Archivos a crear
| Archivo | Proposito |
|---------|-----------|
| `src/hooks/usePermissionGroups.ts` | Hook con queries y mutations |
| `src/components/users/PermissionGroupsTab.tsx` | Pestana de gestion de grupos |
| `src/components/users/PermissionGroupDialog.tsx` | Dialog crear/editar grupo |

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/pages/SystemUsersPage.tsx` | Anadir Tabs con pestana de grupos |
| `src/components/users/UserPermissionsDialog.tsx` | Anadir selector de grupo para asignacion rapida |
| Migracion SQL | Crear tablas + seed de plantillas |

