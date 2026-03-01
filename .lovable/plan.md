

## Plan: Fase 3 (Envio real de email) + Fase 5 (Dashboard de conversion)

---

### Fase 3 -- Envio real de propuestas por email con Resend

**Objetivo**: Conectar el componente `ProposalEmailPreview` existente con el servicio Resend (ya configurado) para enviar propuestas reales al cliente.

**Buena noticia**: Ya existe una Edge Function `send-email` funcional con Resend y el secret `RESEND_API_KEY` ya esta configurado. No hace falta crear una funcion nueva -- reutilizaremos la existente.

#### Paso 1 -- Ampliar ProposalEmailPreview con boton "Enviar"

**Archivo: `src/components/proposals/ProposalEmailPreview.tsx`**

- Anadir props nuevas: `proposalId`, `clientEmail`, `onSent` (callback tras envio exitoso)
- Anadir estado local `isSending` para feedback visual
- Anadir boton "Enviar Email" que:
  1. Muestra dialogo de confirmacion con el email destino
  2. Llama a `supabase.functions.invoke('send-email', ...)` con subject, html (del preview) y to (email del cliente)
  3. Tras exito: llama a `onSent()` para actualizar estado de la propuesta, muestra toast de exito
  4. Tras error: muestra toast con mensaje descriptivo

#### Paso 2 -- Integrar en ProposalDetail

**Archivo: `src/pages/ProposalDetail.tsx`**

- Reemplazar la pestana "Documentos" (placeholder actual) con el componente `ProposalEmailPreview`
- Pasar los datos reales: `proposalTitle`, `clientName`, `clientEmail`, `totalAmount`, `currency`, `validUntil`, `proposalId`
- En `onSent`: actualizar el status de la propuesta a `sent` y registrar `sent_at` via `useProposalActions`, loguear accion en `proposal_audit_log`

#### Paso 3 -- Registrar envio en audit log

**Archivo: `src/hooks/proposals/useProposalActions.ts`**

- Anadir funcion `markAsSent(proposalId)` que:
  - Actualiza `proposals.status = 'sent'` y `sent_at = now()`
  - Llama a `logProposalAction(proposalId, 'sent', 'Email enviado al cliente')`
  - Invalida la query cache

No se requiere migracion SQL ni nuevo secret.

---

### Fase 5 -- Dashboard de conversion (funnel visual)

**Objetivo**: Visualizar el flujo de propuestas (Borrador -> Enviada -> Ganada/Perdida) con metricas de conversion.

#### Paso 1 -- Nuevo componente ProposalConversionFunnel

**Nuevo archivo: `src/components/proposals/ProposalConversionFunnel.tsx`**

- Consulta directa a `proposals` agrupando por `status` para obtener conteos en tiempo real (sin depender de `revenue_metrics`)
- Grafico de embudo horizontal usando Recharts (BarChart horizontal) con los estados: draft, sent, negotiating, won, lost
- Cada barra con el color del estado (mismos colores de `getStatusColor`)
- Debajo del funnel, 3 KPI cards:
  - **Tasa de cierre**: won / (won + lost) en porcentaje
  - **Tiempo medio hasta aceptacion**: diferencia media entre `created_at` y `accepted_at` para propuestas won
  - **Valor pipeline abierto**: suma de `total_amount` de propuestas con status draft/sent/negotiating

#### Paso 2 -- Integrar en la pagina de propuestas

**Archivo: `src/components/proposals/ProposalMetrics.tsx`**

- Importar y renderizar `ProposalConversionFunnel` debajo de las metricas existentes
- El componente es autocontenido (tiene su propia query), no necesita props

---

### Resumen de archivos

| Fase | Archivo | Cambio |
|------|---------|--------|
| 3 | `ProposalEmailPreview.tsx` | Boton enviar + integracion con edge function |
| 3 | `ProposalDetail.tsx` | Reemplazar placeholder Documentos con email preview |
| 3 | `useProposalActions.ts` | Funcion `markAsSent` |
| 5 | Nuevo `ProposalConversionFunnel.tsx` | Funnel + KPIs |
| 5 | `ProposalMetrics.tsx` | Integrar funnel |

No se requieren migraciones SQL ni nuevos secrets.
