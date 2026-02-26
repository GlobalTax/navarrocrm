

## Importación Masiva de Usuarios (Creación Directa)

### Objetivo
Crear un nuevo componente de importación masiva que **cree usuarios reales** (con auth + perfil) usando la edge function `create-user`, en lugar del flujo actual que solo crea invitaciones.

---

### Cambios a Realizar

#### 1. Nuevo componente: `UserBulkCreation.tsx`

Reemplazar el uso de `AIEnhancedBulkUpload` (que inserta en `user_invitations`) por un componente dedicado que:

- Acepte CSV con columnas: `email`, `role`, `first_name`, `last_name`
- Valide localmente (email formato, rol valido, duplicados en el CSV)
- Procese cada usuario llamando a `supabase.functions.invoke('create-user')` secuencialmente (para evitar rate limiting)
- Muestre progreso en tiempo real con barra de progreso
- Al finalizar, muestre un resumen con las credenciales generadas (email + password temporal) para cada usuario creado
- Permita descargar las credenciales como CSV
- Incluya botón de descarga de plantilla CSV

**Estructura del componente:**
- Paso 1: Subir CSV (drag & drop con react-dropzone)
- Paso 2: Validación y vista previa en tabla
- Paso 3: Procesamiento con progreso
- Paso 4: Resumen con credenciales descargables

#### 2. Actualizar `UsersPageDialogs.tsx`

Reemplazar el `AIEnhancedBulkUpload` por el nuevo `UserBulkCreation` en el diálogo de importación masiva.

#### 3. Plantilla CSV

La plantilla incluira estos campos:
```text
email,role,first_name,last_name
juan.perez@empresa.com,senior,Juan,Pérez
maria.garcia@empresa.com,junior,María,García
```

Roles validos: partner, area_manager, senior, junior, finance

---

### Flujo del Usuario

1. Clic en "Importacion Masiva" en la pagina de usuarios
2. Se abre el dialogo con opcion de descargar plantilla CSV
3. Sube el CSV (drag & drop o clic)
4. Se valida localmente: emails validos, roles correctos, sin duplicados
5. Vista previa en tabla con los usuarios a crear
6. Clic en "Crear Usuarios" -- se procesan de 1 en 1 (con pausa de 500ms entre cada uno para evitar rate limiting)
7. Barra de progreso muestra avance y resultados parciales
8. Al terminar: tabla resumen con email + password temporal
9. Boton "Descargar Credenciales CSV" para guardar las credenciales

---

### Detalles Tecnicos

- **Procesamiento:** Secuencial (1 usuario a la vez) usando `useDirectUserCreation` hook existente
- **Manejo de errores:** Si un usuario falla, se registra el error y continua con el siguiente
- **Credenciales:** Se almacenan temporalmente en estado local y se pueden descargar como CSV
- **Validacion:** Email regex, roles en whitelist, deteccion de duplicados dentro del CSV
- **Rate limiting:** Pausa de 500ms entre creaciones para no sobrecargar la edge function

### Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/users/UserBulkCreation.tsx` | Nuevo componente |
| `src/components/users/UsersPageDialogs.tsx` | Reemplazar AIEnhancedBulkUpload por UserBulkCreation |

