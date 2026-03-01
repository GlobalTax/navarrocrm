

## Fix: Los expedientes creados no aparecen en el listado

### Problema
El filtro por defecto es `"active"`, que en el lado del cliente significa "todos los expedientes que no estan cerrados" (`status !== 'closed'`). Sin embargo, la query a Supabase envia `.eq('status', 'active')` literalmente, y ese valor no existe en la base de datos (los valores validos son `open`, `on_hold`, `closed`).

Por eso la query devuelve 0 resultados aunque el expediente se haya creado correctamente con `status: "open"`.

### Solucion

**Archivo:** `src/hooks/cases/useCasesQueries.ts` (linea 51-53)

Cambiar la logica del filtro de status en la query del servidor para que cuando el valor sea `"active"`, en lugar de buscar `status = 'active'`, use `.neq('status', 'closed')` (todos excepto cerrados):

```typescript
if (filters.statusFilter && filters.statusFilter !== 'all') {
  if (filters.statusFilter === 'active') {
    query = query.neq('status', 'closed')
  } else {
    query = query.eq('status', filters.statusFilter)
  }
}
```

Es un cambio de 3 lineas en un solo archivo. Tambien se aplicara la misma logica en la query de paginacion infinita mas abajo en el mismo archivo.
