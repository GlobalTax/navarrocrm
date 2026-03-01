
## Plan: Mejorar PDF de propuestas puntuales y recurrentes

### Objetivo
Anadir datos completos del cliente (nombre, NIF, email, telefono), logo del despacho, cabecera profesional y pie de pagina a ambos tipos de PDF.

---

### Cambio 1 -- Extraer funcion compartida de generacion HTML

**Nuevo archivo: `src/components/proposals/utils/generateProposalPDF.ts`**

Funcion utilitaria que genera el HTML completo del PDF, reutilizable por ambos tipos de propuesta. Recibe:

```text
{
  type: 'one-time' | 'retainer'
  title, refNumber, date, validUntil
  client: { name, nif, email, phone }
  firmName, firmLogo (URL o base64)
  rows (tabla de servicios)
  totals: { subtotal, tax, total, discountInfo? }
  retainerConfig? (solo para recurrentes)
  introduction?, terms?
}
```

Genera HTML con:
- **Cabecera**: logo del despacho (imagen) a la izquierda + nombre del despacho, referencia y fecha a la derecha, linea azul (#0061FF) separadora
- **Bloque cliente**: nombre, NIF/CIF, email y telefono en caja gris con borde
- **Cuerpo**: tabla de servicios, totales, y para retainer la caja de condiciones
- **Pie de pagina**: texto legal + nombre del despacho + "Pagina X" (via CSS `@page` counter), linea separadora superior

Logica de logo: se usara una URL configurable. Si no hay logo, se muestra solo el nombre del despacho en texto grande.

---

### Cambio 2 -- Actualizar ProposalPricingTab (puntuales)

**Archivo: `src/components/proposals/ProposalPricingTab.tsx`**

- Ampliar la interfaz `ClientInfo` para incluir `phone?: string`
- Reemplazar el bloque HTML inline (lineas 112-192) por una llamada a `generateProposalPDF()` con type `'one-time'`
- Pasar datos del cliente incluyendo telefono

---

### Cambio 3 -- Actualizar LegalProposalStepContent (recurrentes)

**Archivo: `src/components/proposals/legal/components/LegalProposalStepContent.tsx`**

- Anadir prop `clientData` al componente (o recibirlo del contexto del wizard) con nombre, NIF, email, telefono
- Reemplazar el bloque HTML inline (lineas 131-217) por una llamada a `generateProposalPDF()` con type `'retainer'`, pasando `retainerConfig`, `introduction`, `terms` y datos del cliente

---

### Cambio 4 -- Pasar datos del cliente al wizard legal

**Archivo: `src/components/proposals/legal/LegalProposalPreview.tsx`**

- Anadir prop `client` con la misma interfaz `{ name, nif, email, phone }` y propagarla al HTML

Los componentes padre que invocan el wizard ya tienen acceso al `contact_id`; se consultaran los datos del contacto para pasarlos.

---

### Diseno del PDF resultante

```text
+--------------------------------------------------+
|  [LOGO]  Nombre del Despacho        REF-XXXXX    |
|           Asesoria integral          01/03/2026   |
|           www.despacho.com           Valid: 30d   |
+==================================================+
|                                                    |
|  DATOS DEL CLIENTE                                 |
|  +----------------------------------------------+ |
|  | Nombre: Empresa S.L.                          | |
|  | NIF: B12345678  |  Email: info@empresa.com    | |
|  | Telefono: +34 612 345 678                     | |
|  +----------------------------------------------+ |
|                                                    |
|  Titulo de la Propuesta                            |
|                                                    |
|  SERVICIOS PROPUESTOS                              |
|  | Concepto | Cant | P.Unit | Total |             |
|  |----------|------|--------|-------|             |
|  | Servicio | 1    | 500 E  | 500 E |             |
|                                                    |
|              Subtotal:  500,00 EUR                 |
|              IVA 21%:   105,00 EUR                 |
|              TOTAL:     605,00 EUR                 |
|                                                    |
|  [Solo retainer: caja condiciones]                 |
|  [Seccion firma]                                   |
|                                                    |
+--------------------------------------------------+
|  Nombre Despacho | Documento informativo | Pag 1  |
+--------------------------------------------------+
```

### Notas tecnicas

- El logo se cargara desde una constante configurable (URL publica o placeholder). No requiere storage ni migracion SQL.
- Se usa CSS `@media print` y `@page` para margenes y pie de pagina en impresion.
- Fuente Manrope desde Google Fonts (ya en uso).
- No se crean nuevas dependencias.

### Archivos afectados

| Archivo | Accion |
|---------|--------|
| `src/components/proposals/utils/generateProposalPDF.ts` | Nuevo - funcion compartida |
| `src/components/proposals/ProposalPricingTab.tsx` | Modificar - usar funcion compartida |
| `src/components/proposals/legal/components/LegalProposalStepContent.tsx` | Modificar - usar funcion compartida + datos cliente |
| `src/components/proposals/legal/LegalProposalPreview.tsx` | Modificar - anadir prop client |
