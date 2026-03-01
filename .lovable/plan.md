
## Convertir SystemUserTable a tabla inline

### Problema
La pagina `/system-users` usa el componente `SystemUserTable.tsx`, que es diferente al `UserTable.tsx` que ya se actualizo. Este componente sigue mostrando tarjetas (cards) en vez de una tabla inline.

### Solucion

**Archivo: `src/components/users/SystemUserTable.tsx`**

Reemplazar el layout de cards (`div` + `space-y-2`) por una tabla HTML real usando los componentes `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.

**Columnas:**
| Nombre | Apellido | Correo | Rol | Estado | Acciones |

**Cambios concretos:**
- Importar componentes de tabla desde `@/components/ui/table`
- Eliminar imports no usados (`formatDistanceToNow`, `es`)
- Reemplazar el `div.space-y-2` (lineas 87-142) por una estructura `Table` con filas por usuario
- Mostrar `first_name`, `last_name`, `email` en columnas separadas
- Mantener badges de rol y estado con los colores existentes
- Mantener el `UserActionsMenu` en la columna de acciones
- Resaltado rojo sutil para usuarios inactivos (`bg-destructive/5`)
- Estilo consistente con el sistema de diseno: `border-[0.5px] border-black rounded-[10px]`

Basicamente se replica la misma estructura que ya tiene `UserTable.tsx` pero adaptada a `SystemUserTable.tsx`, manteniendo la logica de `getSystemStatus` que incluye deteccion de inactividad por dias.
