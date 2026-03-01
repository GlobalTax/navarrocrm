

## Plan: Arreglar scroll del popup de alta masiva

### Problema
El modal de "Alta equipo NRRO" no permite hacer scroll correctamente. Con 55 usuarios en la tabla, el contenido se corta y no se puede navegar. Ademas, los dropdowns de rol (Select) pueden quedar recortados dentro del ScrollArea.

### Solucion

**Archivo: `src/components/users/UserBulkPreloaded.tsx`**

1. **Cambiar ScrollArea por overflow nativo** — Reemplazar el componente `ScrollArea` (linea 255) por un `div` con `overflow-y-auto` y altura maxima. ScrollArea de Radix puede interferir con los Select portaled que hay dentro.

2. **Ajustar DialogContent** — Asegurar que el `DialogContent` tenga `overflow-hidden` para que el scroll interno funcione correctamente, y anadir `DialogDescription` para eliminar el warning de consola.

3. **Anadir `position: 'popper'` al SelectContent** — Para que los dropdowns de rol se rendericen correctamente sin ser recortados por el contenedor con scroll.

### Cambios tecnicos
- Linea 228: anadir `overflow-hidden` al DialogContent
- Lineas 230-233: anadir `DialogDescription` 
- Linea 255: cambiar `ScrollArea` por `div` con `overflow-y-auto max-h-[55vh]`
- Linea 283: anadir `position="popper"` y `className="z-50"` al SelectContent

