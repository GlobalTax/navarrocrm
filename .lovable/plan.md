

## Fase 2: Descuentos por linea de servicio

### Resumen
Permitir aplicar descuentos (porcentaje o importe fijo) a cada linea de servicio en las propuestas, tanto puntuales como recurrentes.

### Paso 1 -- Migracion SQL
Agregar 3 columnas a `proposal_line_items`:
- `discount_type` (varchar, nullable): valores 'percentage' o 'fixed', default null (sin descuento)
- `discount_value` (numeric, nullable, default 0): el valor del descuento (ej. 10 para 10% o 50 para 50 EUR)
- `discount_amount` (numeric, nullable, default 0): el importe calculado del descuento en EUR

### Paso 2 -- Actualizar tipos TypeScript
**Archivo: `src/types/proposals.ts`** (interfaz ProposalLineItem, linea 61-72)
- Anadir `discount_type?: 'percentage' | 'fixed' | null`
- Anadir `discount_value?: number`
- Anadir `discount_amount?: number`

**Archivo: `src/components/proposals/ProposalPricingTab.tsx`** (interfaz local ProposalLineItem, linea 24-35)
- Anadir los mismos 3 campos opcionales

### Paso 3 -- Formulario RecurringProposalForm
**Archivo: `src/components/proposals/RecurringProposalForm.tsx`**

En la funcion `addLineItem` (linea 176): anadir `discount_type: null, discount_value: 0, discount_amount: 0` al nuevo item.

En la funcion `updateLineItem` (linea 193-208): recalcular el total considerando descuento:
```
total_price = (quantity * unit_price) - discount_amount
```
Donde `discount_amount` se calcula segun el tipo:
- Si `percentage`: `(quantity * unit_price) * (discount_value / 100)`
- Si `fixed`: `discount_value`

En la tarjeta de cada servicio (linea 340-410): agregar una fila con:
- Select para tipo de descuento (Sin descuento / Porcentaje / Importe fijo)
- Input numerico para el valor del descuento
- Mostrar el importe del descuento calculado junto al total

### Paso 4 -- Vista de precios (ProposalPricingTab)
**Archivo: `src/components/proposals/ProposalPricingTab.tsx`**

En la tabla de visualizacion (linea 199-236):
- Detectar si alguna linea tiene descuento (`hasAnyDiscount`)
- Si hay descuentos, mostrar columna extra "Descuento" entre Precio Unit. y Total
- El subtotal ya usa `total_price` de cada item, que viene calculado correctamente desde la BD

En el HTML del PDF (linea 110-175):
- Anadir columna "Dto." en la tabla si hay descuentos
- Mostrar el descuento formateado (ej. "-10%" o "-50,00 EUR")

### Paso 5 -- Sanitizacion en useProposalActions
**Archivo: `src/hooks/proposals/useProposalActions.ts`**

Los nuevos campos (`discount_type`, `discount_value`, `discount_amount`) son columnas reales de la BD, por lo que pasan correctamente en el spread `...rest`. No se necesitan cambios adicionales en la sanitizacion.

Los `line_items` ya se recrean en cada actualizacion (delete + insert), asi que los nuevos campos se incluiran automaticamente.

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| Migracion SQL | 3 columnas nuevas en `proposal_line_items` |
| `src/types/proposals.ts` | 3 campos opcionales en `ProposalLineItem` |
| `src/components/proposals/ProposalPricingTab.tsx` | Columna descuento en tabla + PDF |
| `src/components/proposals/RecurringProposalForm.tsx` | Campos de descuento en formulario + calculo automatico |

