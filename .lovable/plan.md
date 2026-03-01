
## Corregir error "retainerConfig column not found" al actualizar propuestas

### Problema

El mismo problema que con `clientId`: el formulario de propuestas incluye un campo `retainerConfig` (objeto JavaScript con la configuracion del retainer) que se pasa tal cual al `.update()` de Supabase. Como no existe una columna `retainerConfig` en la tabla `proposals`, PostgREST lo rechaza.

### Solucion

**Archivo: `src/hooks/proposals/useProposalActions.ts`** (linea 180)

Anadir `retainerConfig` a la lista de campos destructurados que se excluyen del spread:

```typescript
const { line_items, clientId, client, contact, selectedServices, client_id, retainerConfig, ...rest } = proposalData
```

Es un cambio de una sola linea. Los datos del retainer ya se guardan en columnas individuales de la tabla (`retainer_amount`, `included_hours`, `hourly_rate_extra`, etc.), por lo que el objeto `retainerConfig` es solo una estructura temporal del formulario que no debe enviarse a la BD.
