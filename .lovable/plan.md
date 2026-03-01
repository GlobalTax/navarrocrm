

## Eliminar el toggle "Facturable" del timer

### Cambio
Quitar el switch "Facturable" del formulario del timer para que el tiempo siempre se registre como facturable sin dar opcion al usuario.

### Detalle tecnico

**Archivo:** `src/components/time-tracking/ModernTimer.tsx`

1. Eliminar el estado `isBillable` y su setter (linea 83) — ya no es necesario, siempre sera `true`.
2. Eliminar el bloque del Switch "Facturable" (lineas 361-368).
3. En `handleManualRegister` y `handleTimerSave`, fijar `is_billable: true` directamente en lugar de usar la variable.
4. Eliminar la importacion de `Switch` si no se usa en otro sitio del componente.

El resultado es que todo tiempo registrado sera facturable por defecto, y el propietario decidira desde otro lugar si ajustarlo.
