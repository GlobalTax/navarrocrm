

## Corregir errores de compilacion y guardado de propuestas

Hay dos problemas que resolver:

### Problema 1: Identificadores duplicados en types.ts

El archivo `src/integrations/supabase/types.ts` tiene bloques duplicados que impiden la compilacion. Cada una de estas entidades aparece dos veces:

- `deals` (lineas 2223 y 2353)
- `deed_assignees` (lineas 2293 y 2423)
- `performance_metrics` (lineas 7257 y 7378)
- `performance_reviews` (lineas 7296 y 7417)
- `scheduled_exports` (lineas 9587 y 9679)

**Solucion**: Eliminar la segunda copia duplicada de cada bloque. Los duplicados son identicos, asi que simplemente se borran las lineas repetidas.

Bloques a eliminar:
- Lineas 2353-2477 (segundo `deals` + segundo `deed_assignees`)
- Lineas 7378-7498 (segundo `performance_metrics` + segundo `performance_reviews`)
- Lineas 9679-9770 (segundo `scheduled_exports`)

### Problema 2: El builder se cierra antes de confirmar el guardado

En `src/components/proposals/ProposalsPageHandlers.tsx` (lineas 157-158), `saveRecurrentProposal()` se llama y luego inmediatamente `closeRecurrentBuilder()`. Como la mutacion es asincrona, si falla el usuario no ve el error porque el builder ya se cerro.

**Solucion**: Usar los callbacks `onSuccess`/`onError` de la mutacion:

```typescript
saveRecurrentProposal(recurrentProposalData, {
  onSuccess: () => {
    closeRecurrentBuilder()
  },
  onError: (error) => {
    console.error('Error guardando propuesta:', error)
  }
})
```

Esto asegura que el builder solo se cierra si el guardado fue exitoso, y si hay error el usuario lo ve via toast (ya configurado en `useSaveProposal`).

### Archivos a modificar

1. `src/integrations/supabase/types.ts` - Eliminar bloques duplicados
2. `src/components/proposals/ProposalsPageHandlers.tsx` - Cerrar builder solo tras exito

