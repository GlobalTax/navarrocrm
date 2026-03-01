

## Añadir enlace de Cuotas Recurrentes al Sidebar

### Cambios

**1. Descomentar la ruta en `src/router/routes/business.routes.tsx`**
- Descomentar el import de `RecurrentFees` y su ruta `/recurring-fees` para que la pagina sea accesible.

**2. Añadir entrada en el sidebar (`src/components/layout/sidebar/NavigationData.ts`)**
- Añadir "Cuotas Recurrentes" en la seccion "Productividad" (despues de "Time Tracking"), con icono `CreditCard` (ya importado) y url `/recurring-fees`.
- Descomentar la accion rapida "Nueva Cuota" en `quickActions`.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/components/layout/sidebar/NavigationData.ts` | Añadir item "Cuotas Recurrentes" + descomentar accion rapida |
| `src/router/routes/business.routes.tsx` | Descomentar ruta `/recurring-fees` y su import |
