

## Fix: Error al crear expediente - UUID vacío

### Problema
Al crear un expediente, los campos opcionales de tipo UUID (`responsible_solicitor_id`, `originating_solicitor_id`, `practice_area`) se envían como cadenas vacías `""` en lugar de `null`. Postgres rechaza `""` como valor UUID valido con el error `22P02`.

### Solucion

**Archivo:** `src/hooks/cases/useCasesMutations.ts`

Sanitizar los campos UUID opcionales antes de insertar, convirtiendo cadenas vacías y el valor `"none"` a `null`:

```typescript
const insertData = {
  title: caseData.title,
  description: caseData.description || null,
  status: caseData.status,
  contact_id: caseData.contact_id || user.id,
  practice_area: caseData.practice_area || null,
  responsible_solicitor_id: caseData.responsible_solicitor_id || null,
  originating_solicitor_id: caseData.originating_solicitor_id || null,
  billing_method: caseData.billing_method,
  estimated_budget: caseData.estimated_budget || null,
  org_id: user.org_id
}
```

Usando `|| null`, cualquier valor falsy (cadena vacia, undefined, "none" ya convertido a undefined por el wizard) se convierte en `null`, que Postgres acepta para columnas UUID nullable.

Es un cambio de una sola linea logica en un solo archivo.
