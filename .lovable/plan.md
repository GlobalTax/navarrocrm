

## Dashboard visual de horas consumidas vs incluidas por cuota recurrente

### Objetivo
Crear un componente con graficos visuales (barras y donuts) que muestre la comparativa de horas consumidas vs incluidas para cada cuota recurrente activa, integrado en la pagina de Cuotas Recurrentes.

### Componente nuevo

**`src/components/recurring-fees/RecurringFeesHoursChart.tsx`**

Contenido:
- **Grafico de barras horizontal** (recharts `BarChart`): cada barra representa una cuota recurrente, mostrando horas incluidas vs consumidas lado a lado, con colores diferenciados (verde para incluidas, azul para consumidas, rojo si se exceden).
- **Indicadores visuales por cuota**: barra de progreso con porcentaje de utilizacion, coloreada segun umbrales (verde < 80%, ambar 80-100%, rojo > 100%).
- **Resumen global**: grafico tipo `PieChart` o `RadialBarChart` con la utilizacion total agregada.
- **Tabla compacta** debajo del grafico con columnas: Cliente, Cuota, Horas incluidas, Horas usadas, Horas extra, Importe extra.

### Datos
- Se reutiliza el `hoursMap` existente (de `useAllRecurringFeesHours`) que ya se pasa a `RecurringFeesDashboard`.
- Se cruza con la lista de `fees` para obtener nombre del cliente y nombre de la cuota.

### Integracion
- Se inserta en `src/pages/RecurrentFees.tsx` justo despues de `RecurringFeesDashboard`, pasandole `fees` y `hoursMap` como props.

### Librerias
- `recharts` (ya instalada): `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`, `Cell`.
- Estilos consistentes con el sistema de diseno: bordes 0.5px, rounded-[10px], fuente Manrope.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/recurring-fees/RecurringFeesHoursChart.tsx` | Nuevo - graficos de horas |
| `src/pages/RecurrentFees.tsx` | Importar e insertar el nuevo componente |

