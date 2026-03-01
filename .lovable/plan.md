

## Corregir nombres/apellidos y edicion de usuarios

### Problemas encontrados

1. **Los nombres no se guardan al crear usuarios**: La edge function `create-user` recibe `firstName` y `lastName` pero NO los incluye en el INSERT a la tabla `users` (linea 80-86). Solo guarda `id`, `email`, `role`, `org_id` e `is_active`.

2. **El formulario de edicion no permite modificar nombres**: El dialogo `UserFormDialog` solo muestra email (no editable) y rol. No tiene campos para nombre ni apellido, y el UPDATE solo modifica el `role`.

### Cambios

**1. Edge Function `supabase/functions/create-user/index.ts`**
- Agregar `first_name` y `last_name` al objeto del INSERT (linea 80-86)

**2. Redesplegar la edge function**
- Tras el cambio, redesplegar `create-user`

**3. Formulario de edicion `src/components/users/UserFormDialog.tsx`**
- Agregar estados `firstName` y `lastName` que se inicialicen con `user.first_name` y `user.last_name`
- Agregar campos de input para nombre y apellido en el formulario
- Incluir `first_name` y `last_name` en el UPDATE de Supabase junto con el `role`

**4. Actualizar usuarios existentes (one-time fix)**
- Ejecutar un UPDATE SQL en Supabase que ponga los nombres correctos a los usuarios ya creados, usando los datos de `PRELOADED_USERS` que ya estan definidos en `UserBulkPreloaded.tsx`
- Esto se hara mediante una query SQL directa

### Resultado
- Los nuevos usuarios se crearan con nombre y apellido
- Los usuarios existentes se podran editar (nombre, apellido, rol)
- Los usuarios de NRRO ya creados tendran sus nombres rellenados

