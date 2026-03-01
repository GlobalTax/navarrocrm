
## Plan: Vincular horas de time tracking a cuotas recurrentes

### Problema actual
Las cuotas recurrentes tienen campos de "horas incluidas" y "tarifa horas extra", pero no hay forma de registrar tiempo contra ellas. El timer y el formulario de time entries no permiten seleccionar una cuota recurrente.

### Solucion

Conectar `time_entries` con `recurring_fees` para que al registrar tiempo se pueda asociar a una cuota recurrente, y luego mostrar el consumo de horas en las tarjetas y dashboard de cuotas.

---

### Cambio 1 -- Anadir columna `recurring_fee_id` a `time_entries`

Migracion SQL:
- `ALTER TABLE time_entries ADD COLUMN recurring_fee_id UUID REFERENCES recurring_fees(id)`
- Indice en `recurring_fee_id`

Esto permite vincular cada entrada de tiempo a una cuota recurrente.

### Cambio 2 -- Selector de cuota recurrente en el timer

**Archivo:** `src/components/time-tracking/ModernTimer.tsx`

- Anadir un dropdown "Cuota recurrente" (opcional) junto al selector de expediente
- Cargar cuotas activas con horas incluidas > 0 desde `recurring_fees`
- Al seleccionar una cuota, autocompletar el cliente y marcar como facturable
- Pasar `recurring_fee_id` al crear la time entry

**Archivo:** `src/hooks/useTimeEntries.ts`

- Anadir `recurring_fee_id` al tipo `CreateTimeEntryData`
- Incluirlo en el insert a `time_entries`

### Cambio 3 -- Mostrar consumo de horas en la tarjeta de cuota recurrente

**Archivo:** `src/components/recurring-fees/RecurringFeeCard.tsx`

- Consultar horas consumidas del periodo actual (mes/trimestre/ano segun frecuencia)
- Mostrar barra de progreso: "X de Y horas consumidas"
- Indicador visual cuando se superan las horas incluidas (rojo)

### Cambio 4 -- Panel de horas en detalle de cuota recurrente

**Archivo:** `src/components/recurring-fees/RecurringFeesDashboard.tsx`

- Anadir metrica global de horas consumidas vs incluidas
- Porcentaje de utilizacion de horas

### Cambio 5 -- Hook para consultar horas por cuota

**Archivo:** `src/hooks/recurringFees/useRecurringFeeTimeEntries.ts` (nuevo)

Hook que consulta `time_entries` filtradas por `recurring_fee_id` y periodo de facturacion actual, calculando:
- Horas usadas
- Horas restantes
- Horas extra
- Importe extra estimado

---

### Resumen tecnico

| Archivo | Accion |
|---------|--------|
| Migracion SQL | Anadir `recurring_fee_id` a `time_entries` |
| `src/hooks/useTimeEntries.ts` | Anadir campo `recurring_fee_id` |
| `src/hooks/recurringFees/useRecurringFeeTimeEntries.ts` | Crear -- hook de horas por cuota |
| `src/components/time-tracking/ModernTimer.tsx` | Anadir selector de cuota recurrente |
| `src/components/recurring-fees/RecurringFeeCard.tsx` | Mostrar barra de consumo de horas |
| `src/components/recurring-fees/RecurringFeesDashboard.tsx` | Metricas globales de horas |

### Flujo del usuario

1. Al registrar tiempo en el timer, selecciona opcionalmente una cuota recurrente
2. En la lista de cuotas recurrentes, cada tarjeta muestra cuantas horas se han consumido del periodo actual
3. Si se superan las horas incluidas, se calcula automaticamente el importe extra con la tarifa configurada
