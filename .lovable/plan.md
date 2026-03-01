

## Corregir descarga de PDF en propuestas legales recurrentes

### Problema

El boton "Generar PDF" en la vista previa de la propuesta legal no funciona porque:

1. Usa `fetch('/functions/v1/generate-proposal-pdf')` con una ruta relativa incorrecta (deberia usar `supabase.functions.invoke()`)
2. La edge function `generate-proposal-pdf` espera un `proposalId` de una propuesta ya guardada en BD, pero desde el builder legal se envian datos crudos (titulo, servicios, etc.) sin un ID guardado
3. El resultado es siempre un error de red o un 404/400

### Solucion: Generar el PDF en el cliente

En lugar de depender de la edge function (que requiere una propuesta guardada), generaremos el HTML del PDF directamente en el cliente y abriremos una ventana para imprimir/guardar como PDF. Esto es consistente con como ya funciona `DocumentPreview.tsx` (que usa `window.print()`).

### Cambios

**Archivo: `src/components/proposals/legal/components/LegalProposalStepContent.tsx`**

Reemplazar el handler `onGeneratePDF` (lineas 131-171) para que:
1. Construya un HTML completo con todos los datos de la propuesta (titulo, cliente, area, servicios, retainer, terminos)
2. Use fuente Manrope (sans-serif) segun el sistema de diseno
3. Incluya toda la informacion: servicios con precios, condiciones de retainer, introduccion, terminos
4. Abra una nueva ventana con `window.open()` y llame a `window.print()` para que el usuario pueda guardar como PDF

El HTML generado incluira:
- Cabecera con titulo y area de practica
- Datos del cliente
- Fecha y validez
- Seccion de introduccion
- Tabla de servicios con cantidades, precios unitarios y totales
- Condiciones del retainer (cuota, horas incluidas, tarifa extra, duracion)
- Subtotal, IVA (21%) y total
- Terminos y condiciones
- Bloque de firmas y aceptacion

**No se necesitan cambios en la edge function** ya que la generacion sera 100% cliente.

### Resultado esperado

Al hacer clic en "Generar PDF", se abrira una nueva pestana con el documento formateado y el dialogo de impresion del navegador, donde el usuario puede seleccionar "Guardar como PDF" para descargarlo.

