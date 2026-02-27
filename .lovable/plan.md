

## Corregir sincronización automática Quantum: 0 importados, 1001 omitidos

### Problema

El flujo de "sincronización manual" (`QuantumSyncStatus` -> edge function con `auto_sync: true`) usa una lógica diferente al importador manual. La función `processAutomaticSync` en `supabase/functions/quantum-clients/index.ts`:

1. **Detecta como "duplicado" todo contacto que ya tenga `quantum_customer_id` coincidente** (línea 163) y lo salta completamente.
2. **Solo intenta `.insert()` los nuevos** (línea 237), nunca actualiza los existentes.

Como los 1001 contactos ya fueron importados previamente, todos se marcan como duplicados y se saltan. Resultado: 0 importados, 1001 omitidos.

### Solución

Cambiar `processAutomaticSync` para que use **upsert** en lugar de insert, y que no salte los contactos que ya existen por `quantum_customer_id`, sino que los actualice.

### Cambios en `supabase/functions/quantum-clients/index.ts`

**Estrategia**: En vez de separar "nuevos" vs "duplicados" y solo insertar los nuevos, procesar TODOS los contactos con upsert:

1. Eliminar la lógica de detección de duplicados por `quantum_customer_id` (líneas 148-208) que marca todo como "skip".
2. Procesar todos los contactos con `.upsert()` usando `onConflict: 'org_id,quantum_customer_id'`.
3. Para mayor eficiencia, hacer upsert en lotes (batches de ~100) en vez de uno a uno.
4. Mantener el conteo de "importados" (nuevos + actualizados) y "omitidos" (errores de validación).

Esquema simplificado del nuevo flujo:

```text
customers (1001)
    |
    v
[Validar datos basicos]
    |
    +-- invalidos --> skipped (con log)
    |
    +-- validos --> upsert en batch
                      |
                      v
                 imported count
```

### Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/quantum-clients/index.ts` | Reescribir `processAutomaticSync` para usar upsert en batch en vez de skip+insert individual |

### Resultado esperado
- La sincronización actualiza los 1001 contactos existentes con datos frescos de Quantum.
- Contactos nuevos que aparezcan en Quantum se crean automáticamente.
- El toast muestra "1001 contactos importados" (o similar) en vez de "0 importados, 1001 omitidos".

