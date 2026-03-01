
## Corregir error "Could not find the 'clientId' column" al actualizar propuestas

### Problema

En `src/hooks/proposals/useProposalActions.ts`, la funcion `updateProposal` (linea 185-188) hace un spread directo de los datos del formulario hacia Supabase:

```typescript
.update({
  ...proposalMainData,  // <-- incluye clientId, que no existe en la BD
  updated_at: new Date().toISOString()
})
```

El formulario usa `clientId` (camelCase) pero la columna real en la base de datos es `contact_id`. PostgREST rechaza el campo desconocido.

### Solucion

**Archivo: `src/hooks/proposals/useProposalActions.ts`** (lineas 178-191)

En lugar de hacer spread directo de todos los datos, mapear explicitamente los campos del formulario a las columnas de la BD y filtrar campos que no pertenecen a la tabla `proposals`:

```typescript
// Separar line_items y campos del formulario que necesitan mapeo
const { line_items, clientId, client, contact, selectedServices, ...rest } = proposalData

// Construir datos limpios para la BD
const cleanData: Record<string, any> = { ...rest }

// Mapear clientId a contact_id si viene del formulario
if (clientId) {
  cleanData.contact_id = clientId
}

// Eliminar campos computados/join que no son columnas
delete cleanData.client_id

const { error: updateError } = await supabase
  .from('proposals')
  .update({
    ...cleanData,
    updated_at: new Date().toISOString()
  })
  .eq('id', proposalId)
```

### Campos a excluir del spread

Estos campos vienen del formulario o de JOINs pero no son columnas de `proposals`:
- `clientId` → se mapea a `contact_id`
- `client` → datos del JOIN con contacts
- `contact` → datos del JOIN con contacts  
- `selectedServices` → se procesan aparte como line_items
- `client_id` → campo computado de compatibilidad

### Resultado

Las propuestas se actualizaran correctamente sin el error de columna no encontrada en el schema cache.
