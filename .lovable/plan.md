

## Redisenar el Timer para permitir entrada manual de horas y minutos

### Situacion actual
El `ModernTimer` solo permite registrar tiempo mediante un cronometro (play/pause/stop). No hay forma de introducir manualmente horas y minutos como se ve en la imagen de referencia.

### Cambios propuestos

**Archivo:** `src/components/time-tracking/ModernTimer.tsx`

Se reorganiza el formulario para seguir el diseno de la imagen de referencia:

1. **Cabecera con metricas rapidas**: Mostrar "hoy / semana / mes" con horas acumuladas (consulta a `time_entries`).

2. **Formulario de entrada manual en una fila compacta**:
   - Input numerico "Horas" (0-23)
   - Input numerico "Min" (0-59)
   - Date picker "Fecha" (por defecto hoy)
   - Selector de caso/expediente (Mandato)
   - Selector "Tipo de tarea"
   - Input de descripcion
   - Boton "+ Registrar"

3. **Checkbox "Facturable" y enlace "Mas opciones"**: Al expandir "Mas opciones" se muestran los campos actuales de cuota recurrente y tipo de actividad.

4. **El cronometro se mantiene** como modo alternativo accesible desde un toggle o boton secundario, pero el modo por defecto sera la entrada manual.

### Detalle tecnico

- Anadir estados `manualHours` y `manualMinutes` (number, default 0 y 30)
- Anadir estado `entryDate` (Date, default hoy)
- Al pulsar "+ Registrar", calcular `duration_minutes = manualHours * 60 + manualMinutes` y crear la entrada
- Mover la seccion del cronometro circular a un area colapsable o tab secundario
- Consultar horas del dia/semana/mes actual con una query a `time_entries` filtrada por usuario y rango de fechas
- Layout horizontal en desktop (grid), vertical en mobile (stack)

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/time-tracking/ModernTimer.tsx` | Redisenar con entrada manual como modo principal, cronometro como secundario, y metricas de hoy/semana/mes |

