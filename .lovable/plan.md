

## Corregir importación Quantum: usar upsert en lugar de insert

### Problema
La importación Quantum falla con `duplicate key value violates unique constraint "idx_contacts_quantum_unique"` porque el codigo usa `.insert()` (linea 262-264 de `QuantumClientImporter.tsx`). Cuando un contacto ya fue importado previamente, el insert falla porque ya existe un registro con el mismo `quantum_customer_id` + `org_id`.

Ademas, hay 3 contactos con emails invalidos que fallan la validacion pero esto es comportamiento correcto (se saltan y se reportan).

### Solucion

**Archivo:** `src/components/quantum/QuantumClientImporter.tsx`

Cambiar el `.insert(contactsData)` por `.upsert()` con `onConflict` apuntando a la constraint existente `idx_contacts_quantum_unique` (que es sobre `org_id, quantum_customer_id`):

```typescript
// ANTES (linea 262-264):
const { error } = await supabase
  .from('contacts')
  .insert(contactsData)

// DESPUES:
const { error } = await supabase
  .from('contacts')
  .upsert(contactsData, {
    onConflict: 'org_id,quantum_customer_id',
    ignoreDuplicates: false  // false = actualizar datos si ya existe
  })
```

Con `ignoreDuplicates: false`, los contactos que ya existan se **actualizaran** con los datos mas recientes de Quantum (nombre, direccion, telefono, etc.). Si se prefiere simplemente saltar los duplicados sin actualizar, se cambiaria a `true`.

Tambien se mejorara el mensaje de exito para indicar cuantos fueron creados vs actualizados (aunque Supabase no distingue esto en la respuesta, se puede informar al usuario que los duplicados fueron actualizados).

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/quantum/QuantumClientImporter.tsx` | Cambiar `.insert()` por `.upsert()` con `onConflict` |

### Resultado esperado
- Importar contactos de Quantum funciona tanto la primera vez como en reimportaciones.
- Los contactos existentes se actualizan con los datos mas recientes.
- Los 3 contactos con email invalido siguen saltandose (comportamiento correcto).

