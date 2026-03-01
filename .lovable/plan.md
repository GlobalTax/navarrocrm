

## Plan: Email de bienvenida para primer acceso

### Objetivo
Permitir enviar un email de bienvenida a usuarios nuevos con dos modalidades: (A) credenciales temporales o (B) enlace de activacion. Ademas, poder reenviar el email desde la tabla de usuarios existentes.

---

### Cambio 1 -- Crear edge function `send-welcome-email`

**Archivo:** `supabase/functions/send-welcome-email/index.ts`

Nueva edge function que soporta dos modos:

- **Modo "credentials"**: Recibe `email`, `password`, `role`, `firstName`. Envia email con las credenciales (email + contrasena temporal) y un boton para ir al login.
- **Modo "activation"**: Recibe `email`, `role`, `token`. Envia email con enlace a `/activate-account?token=...` (reutiliza la pagina existente).

Usa `RESEND_API_KEY` (ya configurada) y Resend para enviar. El template HTML seguira el mismo estilo del email de invitacion existente (colores `#0061FF`, fuente del sistema, border-radius 10px).

La URL base se construira con `SITE_URL` o fallback a la URL publicada del proyecto (`https://navarrocrm.lovable.app`).

### Cambio 2 -- Opcion de enviar email al crear usuario directo

**Archivo:** `src/components/users/DirectUserCreationDialog.tsx`

Tras crear exitosamente un usuario (pantalla de credenciales):
- Anadir boton "Enviar credenciales por email" junto al boton "Copiar Credenciales"
- Al hacer click, llama a `send-welcome-email` en modo "credentials"
- Feedback con toast de exito/error

### Cambio 3 -- Checkbox en formulario de creacion

**Archivo:** `src/components/users/DirectUserCreationDialog.tsx`

En el formulario de creacion, anadir un checkbox: "Enviar email de bienvenida con enlace de activacion" (desactivado por defecto).

Si esta marcado, tras crear el usuario:
1. Crea una invitacion en `user_invitations` con token
2. Envia email via `send-welcome-email` en modo "activation"
3. El usuario recibira un enlace para establecer su propia contrasena

### Cambio 4 -- Accion "Enviar email de acceso" en menu de usuario

**Archivo:** `src/components/users/UserActionsMenu.tsx`

Anadir opcion "Enviar email de acceso" en el `DropdownMenu` de cada usuario, con icono `Mail`.

**Archivo:** `src/components/users/SendAccessEmailDialog.tsx` (nuevo)

Modal que permite elegir:
- **Opcion A**: "Regenerar contrasena y enviar credenciales" -- llama a `regenerate-user-password` (ya existe) y luego `send-welcome-email` modo credentials
- **Opcion B**: "Enviar enlace de activacion" -- genera token de invitacion y envia email modo activation

### Cambio 5 -- Envio masivo desde la barra de seleccion

**Archivo:** `src/components/users/SystemUserTable.tsx`

Junto al boton "Asignar permisos" en la barra de acciones masivas, anadir boton "Enviar email de acceso" con icono `Mail`.

**Archivo:** `src/components/users/BulkSendAccessEmailDialog.tsx` (nuevo)

Modal similar al individual pero para multiples usuarios:
- Elegir modo (credenciales o activacion)
- Barra de progreso durante el envio secuencial
- Resumen al finalizar (enviados / fallidos)

### Cambio 6 -- Conectar callbacks en la pagina padre

**Archivo:** Pagina de System Users (donde se renderiza `SystemUserTable`)

Pasar el nuevo callback `onSendAccessEmail` al `UserActionsMenu` y gestionar el estado del dialogo.

---

### Archivos

| Archivo | Accion |
|---------|--------|
| `supabase/functions/send-welcome-email/index.ts` | Crear -- edge function de envio |
| `src/components/users/DirectUserCreationDialog.tsx` | Modificar -- boton enviar + checkbox activacion |
| `src/components/users/UserActionsMenu.tsx` | Modificar -- nueva opcion menu |
| `src/components/users/SendAccessEmailDialog.tsx` | Crear -- modal individual |
| `src/components/users/BulkSendAccessEmailDialog.tsx` | Crear -- modal masivo |
| `src/components/users/SystemUserTable.tsx` | Modificar -- boton masivo |
| Pagina padre System Users | Modificar -- conectar dialogo |

### Flujo resumido

1. **Al crear usuario**: opcionalmente enviar email con credenciales o enlace de activacion
2. **Desde la tabla**: click en "..." de un usuario y "Enviar email de acceso", elige modo
3. **Masivo**: seleccionar varios usuarios, click "Enviar email de acceso", elige modo, procesamiento con progreso
