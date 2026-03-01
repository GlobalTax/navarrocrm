
## Corregir descarga de PDF en propuestas puntuales

### Problema

El boton "Generar PDF" en `ProposalPricingTab.tsx` (usado en la vista de detalle de propuestas puntuales) todavia usa `supabase.functions.invoke('generate-proposal-pdf')`, que falla por las mismas razones que ya corregimos en las propuestas recurrentes.

### Solucion

Reemplazar la llamada a la edge function (lineas 94-147 de `ProposalPricingTab.tsx`) con generacion de PDF en el cliente usando `window.open()` + `window.print()`, igual que hicimos para las propuestas legales.

### Cambios

**Archivo: `src/components/proposals/ProposalPricingTab.tsx`** (lineas 94-147)

Reemplazar el handler del boton "Generar PDF" para que:
1. Construya un documento HTML completo con los datos disponibles (lineItems, subtotal, IVA, total)
2. Use fuente Manrope y estilos profesionales consistentes con el sistema de diseno
3. Abra una nueva ventana y llame a `window.print()` para permitir guardar como PDF

El HTML incluira:
- Cabecera con titulo "Propuesta Comercial" y numero de propuesta
- Tabla de servicios con concepto, cantidad, precio unitario, y total por linea
- Subtotal, IVA (21%) y total final
- Formato de moneda en EUR con formato espanol

Tambien se eliminara el import de `supabase` si ya no se usa en el componente (actualmente se usa en el query, asi que se mantiene).
