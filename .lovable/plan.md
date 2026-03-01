

## Plan de Mejora Integral: Propuestas Puntuales y Recurrentes

### Fase 1 -- PDF Profesional con datos del cliente (ambos tipos)

**Objetivo**: Mejorar el PDF generado para incluir datos completos del cliente y un diseno mas profesional.

**Cambios en `src/components/proposals/ProposalPricingTab.tsx`**:
- Recibir datos del cliente (nombre, email, NIF/CIF) y titulo de la propuesta como props adicionales
- Redisenar el HTML del PDF para incluir:
  - Cabecera con logo/nombre del despacho (configurable)
  - Bloque "Datos del cliente": nombre, NIF/CIF, email
  - Bloque "Datos de la propuesta": numero, fecha, validez
  - Tabla de servicios mejorada con columna de descuento
  - Pie con condiciones legales basicas y fecha de generacion

**Cambios en `src/pages/ProposalDetail.tsx`** (linea 571):
- Pasar `proposal.client` y `proposal.title` como props a `ProposalPricingTab`

---

### Fase 2 -- Descuentos por linea de servicio

**Objetivo**: Permitir aplicar descuentos (% o EUR fijos) a cada servicio individual.

**Cambios en la BD** (migracion SQL):
- Agregar columnas a `proposal_line_items`: `discount_type` (enum: 'percentage' | 'fixed'), `discount_value` (numeric), `discount_amount` (numeric computado)

**Cambios en `src/components/proposals/RecurringProposalForm.tsx`**:
- Anadir campos de descuento en cada card de servicio (tipo + valor)
- Recalcular `total_price` = (quantity x unit_price) - discount_amount
- Mostrar el descuento en el resumen por linea

**Cambios en `src/components/proposals/ProposalPricingTab.tsx`**:
- Mostrar columna "Descuento" en la tabla si algun item tiene descuento
- Incluir descuentos en el PDF generado

**Cambios en tipos** (`src/types/proposals.ts`):
- Anadir `discount_type`, `discount_value`, `discount_amount` a `ProposalLineItem`

---

### Fase 3 -- Envio real de email con Resend

**Objetivo**: Conectar el componente `ProposalEmailPreview` existente con el servicio Resend para enviar propuestas reales por email.

**Nueva Edge Function**: `send-proposal-email`
- Recibe: proposal_id, destinatario (email del cliente)
- Usa Resend (ya instalado como dependencia) para enviar el HTML del email
- Actualiza el estado de la propuesta a 'sent' y registra `sent_at`

**Cambios en `src/components/proposals/ProposalEmailPreview.tsx`**:
- Anadir boton "Enviar Email" junto al preview
- Llamar a la edge function al confirmar
- Mostrar confirmacion con toast

**Cambios en `src/pages/ProposalDetail.tsx`**:
- Integrar `ProposalEmailPreview` en la pestana "Documentos" o como accion del boton "Enviar"
- Pasar datos reales del cliente y propuesta

---

### Fase 4 -- Pestana de Historial funcional

**Objetivo**: Registrar y mostrar cambios de estado y ediciones de las propuestas.

**Nueva tabla SQL**: `proposal_history`
- Campos: `id`, `proposal_id`, `action` (created/updated/status_changed/sent/accepted), `old_value` (jsonb), `new_value` (jsonb), `created_by`, `created_at`, `org_id`
- Trigger o insert manual desde las acciones existentes

**Nuevo componente**: `src/components/proposals/ProposalHistoryTab.tsx`
- Timeline vertical con iconos por tipo de accion
- Muestra quien hizo el cambio, cuando, y que cambio

**Cambios en `src/pages/ProposalDetail.tsx`** (linea 581-586):
- Reemplazar el placeholder de "Historial" con el nuevo componente
- Pasar `proposalId` como prop

**Cambios en `src/hooks/proposals/useProposalActions.ts`**:
- Insertar registro en `proposal_history` al cambiar estado o actualizar datos

---

### Fase 5 -- Dashboard de conversion (metricas mejoradas)

**Objetivo**: Crear un funnel visual que muestre el flujo Draft -> Sent -> Won/Lost con metricas de conversion.

**Nuevo componente**: `src/components/proposals/ProposalConversionFunnel.tsx`
- Grafico de embudo usando Recharts (ya instalado)
- Metricas: tasa de conversion (sent->won), tiempo medio por etapa, valor medio por estado
- Filtro por rango de fechas

**Cambios en `src/components/proposals/ProposalMetrics.tsx`**:
- Integrar el funnel debajo de las metricas actuales
- Anadir cards con KPIs: "Tasa de cierre", "Tiempo medio hasta aceptacion", "Valor pipeline abierto"

---

### Resumen tecnico de archivos afectados

| Fase | Archivos | Tipo de cambio |
|------|----------|---------------|
| 1 | `ProposalPricingTab.tsx`, `ProposalDetail.tsx` | Modificacion |
| 2 | `RecurringProposalForm.tsx`, `ProposalPricingTab.tsx`, `types/proposals.ts` | Modificacion + migracion SQL |
| 3 | `ProposalEmailPreview.tsx`, `ProposalDetail.tsx` | Modificacion + nueva edge function |
| 4 | `ProposalDetail.tsx`, nuevo `ProposalHistoryTab.tsx`, `useProposalActions.ts` | Modificacion + nuevo componente + migracion SQL |
| 5 | Nuevo `ProposalConversionFunnel.tsx`, `ProposalMetrics.tsx` | Nuevo componente + modificacion |

### Orden de implementacion recomendado

1. **Fase 1** (PDF mejorado) -- impacto inmediato, sin cambios en BD
2. **Fase 2** (Descuentos) -- requiere migracion SQL
3. **Fase 4** (Historial) -- requiere migracion SQL, pero independiente de fase 2
4. **Fase 3** (Email real) -- requiere configurar secret de Resend y edge function
5. **Fase 5** (Dashboard) -- solo frontend, puede hacerse en cualquier momento

