

## Convertir la lista de usuarios a tabla inline

### Problema actual
La vista de usuarios muestra tarjetas apiladas (cards) con solo el email. No muestra nombre ni apellido, y las acciones estan en un menu desplegable poco accesible.

### Solucion
Reemplazar el layout de cards por una tabla HTML real (`<Table>`) usando los componentes de `src/components/ui/table.tsx` ya existentes.

### Columnas de la tabla
| Nombre | Apellido | Correo | Rol | Estado | Acciones |
|--------|----------|--------|-----|--------|----------|

### Cambios

**Archivo: `src/components/users/UserTable.tsx`**

- Importar los componentes `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` de `@/components/ui/table`
- Reemplazar el layout actual de `div` + cards por una tabla inline con las columnas: Nombre, Apellido, Correo, Rol, Estado, Acciones
- Mostrar `user.first_name` y `user.last_name` en sus columnas respectivas (con fallback a "-" si estan vacios)
- Mantener el Badge de rol con los colores actuales
- Mantener el Badge "Inactivo" en la columna Estado
- Mantener el `UserActionsMenu` (menu de 3 puntos) en la columna Acciones
- Aplicar estilos del sistema de diseno: `border-0.5 border-black rounded-[10px]` en la Card contenedora
- Filas con hover sutil y resaltado rojo para usuarios inactivos

### Sin cambios necesarios en otros archivos
- `useUsers.ts` ya trae `first_name` y `last_name` con `select('*')`
- `UserActionsMenu.tsx` se mantiene igual
- No se necesitan cambios en la pagina ni en otros hooks
