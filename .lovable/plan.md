

## Cuotas Recurrentes: Listado con entrada rapida de horas

### Concepto

Redisenar la pagina de Cuotas Recurrentes para que sea una herramienta agil de registro de horas. La idea es que el listado de cuotas funcione como una tabla compacta donde, de un vistazo, el usuario vea cada cuota con su consumo de horas y pueda registrar tiempo directamente sin salir de la pantalla.

### Diseno propuesto

La pagina tendra dos zonas:

1. **Barra superior de entrada rapida** (siempre visible): Un formulario compacto en una sola fila con campos de Horas, Minutos, selector de Cuota, descripcion breve y boton "Registrar". Similar al timer manual actual pero contextualizado a cuotas.

2. **Tabla/listado de cuotas** con columnas:
   - Cliente
   - Nombre cuota
   - Horas incluidas
   - Horas consumidas (periodo actual)
   - Horas restantes
   - Barra de progreso visual
   - Horas extra + importe extra
   - Acciones (editar, pausar, etc.)

Esto permite maximo agilidad: seleccionar cuota del dropdown, poner horas y minutos, descripcion y registrar. Todo en un solo clic.

### Cambios tecnicos

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/pages/RecurrentFees.tsx` | Simplificar layout: quitar dashboard pesado, anadir barra de entrada rapida arriba y tabla compacta abajo |
| `src/components/recurring-fees/RecurringFeesList.tsx` | Reemplazar grid de cards por tabla compacta con columnas de horas, progreso y acciones |
| `src/components/recurring-fees/RecurringFeesDashboard.tsx` | Reducir a una fila de 4 metricas compactas (sin el bloque grande de horas, que ahora esta en la tabla) |

**Archivo nuevo:**

| Archivo | Contenido |
|---------|-----------|
| `src/components/recurring-fees/QuickTimeEntry.tsx` | Componente de entrada rapida: inputs de horas/min + select de cuota + descripcion + boton registrar. Reutiliza `useTimeEntries.createTimeEntry` con `recurring_fee_id` |

### Flujo del usuario

1. Abre la pagina de Cuotas Recurrentes
2. Ve arriba el formulario rapido: Horas | Min | Cuota (dropdown) | Descripcion | [Registrar]
3. Abajo ve la tabla con todas las cuotas activas y su consumo en tiempo real
4. Selecciona cuota, pone "2h 30min", escribe "Revision trimestral IVA", pulsa Registrar
5. La tabla se actualiza mostrando las nuevas horas consumidas y la barra de progreso avanza

### Detalles de implementacion

- El componente `QuickTimeEntry` usara el hook existente `useTimeEntries.createTimeEntry` pasando el `recurring_fee_id`
- Al registrar, se invalida la query `all-recurring-fees-hours` para que la tabla se actualice
- La tabla usara los datos de `useAllRecurringFeesHours` que ya existe y hace una sola query batch
- Se eliminara el toggle "Facturable" (todas las horas de cuotas son facturables por defecto)
- Se mantienen las metricas principales en formato compacto (4 cards pequenas)
- Se conservan los filtros y acciones existentes (nueva cuota, generar facturas, exportar CSV)

