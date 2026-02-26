
Objetivo
Eliminar de forma robusta el problema de “empresas dentro de personas físicas” y añadir una clasificación inteligente (reglas + IA opcional) que “aprenda” en el flujo de importación y alta, sin romper performance ni UX.

Diagnóstico (revisión profunda ya hecha)
1. El listado de Personas Físicas filtra bien a nivel técnico:
- `useInfinitePersons` usa `.in('client_type', ['particular', 'autonomo'])`.
- Por tanto, si aparece una empresa ahí, es porque está guardada como `particular/autonomo`.

2. El problema principal es calidad de datos, no del filtro:
- Hay 27 registros sospechosos con nombre de empresa clasificados como persona.
- Distribución encontrada:
  - `source=manual`: 16
  - `source=quantum_auto`: 11

3. Fuentes probables de mala clasificación:
- Importación manual / CSV (por defecto cae mucho en `particular`).
- Flujo Quantum (hay heurística de NIF y keywords, pero no cubre todos los casos y no hay “cola de revisión” persistente).
- No hay trigger de DB que valide semánticamente “nombre parece empresa + client_type persona”.

4. Hallazgo adicional importante de integridad:
- Existen dos triggers activos de validación en `contacts` (`trigger_validate_person_company_relation` y `validate_person_company_relation_trigger`). Esto puede duplicar lógica y complicar mantenimiento.
- No rompe este caso directamente, pero conviene normalizar en la fase de hardening.

Propuesta de solución (Sprint completo, por fases)
Fase 1 — Corrección inmediata de datos existentes (impacto alto, bajo riesgo)
1. Crear una migración SQL de saneamiento con:
- Clasificación por reglas determinísticas en `name` + patrones de `dni_nif` (S.L., S.A., LTD, LIMITED, GMBH, FUNDACIÓN, ASSOCIACIÓ, etc.).
- Reasignar `client_type='empresa'` donde la confianza de regla sea alta.
- Registrar auditoría de cambios en tabla nueva de revisión (ver Fase 2) para trazabilidad.
- Excluir casos ambiguos (no autocorregir) para revisión manual.

2. Añadir query de verificación post-migración:
- Conteo de “sospechosos por patrón” antes/después.
- Métrica por `source` para comprobar mejora real.

Resultado esperado:
- Personas físicas deja de mostrar la mayoría de empresas “falsas” inmediatamente.

Fase 2 — Capa de clasificación inteligente persistente (reglas + IA)
1. Añadir tabla de revisión (`contact_classification_reviews`):
- Campos sugeridos:
  - `id`, `org_id`, `contact_id`, `current_client_type`, `suggested_client_type`
  - `confidence` (0-1), `reason` (jsonb), `status` (`pending|approved|rejected|auto_applied`)
  - `source` (`rule_engine|ai_bulk_validate|quantum_auto|manual_form`)
  - `created_at`, `reviewed_at`, `reviewed_by`
- RLS por `org_id`.

2. Añadir función SQL/RPC para detectar candidatos:
- `detect_misclassified_contacts(org_uuid, limit, source_filter, confidence_min)`.
- Devuelve candidatos con score y razones.

3. IA opcional para casos ambiguos:
- Reutilizar Edge Function (`ai-bulk-validate`) pero migrando su llamada al gateway Lovable AI (no OpenAI directo) y modelo por defecto `google/gemini-3-flash-preview`.
- Solo para clasificar “ambiguos”, no para todo (coste controlado).
- Guardar sugerencia IA en `reason` + `confidence`.

Resultado esperado:
- Pipeline repetible de detección + revisión, no solo parche puntual.

Fase 3 — Prevención en puntos de entrada (no volver a ensuciar datos)
1. Formulario de persona (`PersonFormDialog` / `usePersonFormSubmit`):
- Antes de guardar:
  - Ejecutar chequeo de reglas local (rápido).
  - Si detecta “parece empresa” y `client_type` es persona:
    - Mostrar alerta clara (no técnica): “Este nombre parece empresa, ¿quieres cambiar a Empresa?”
    - Permitir confirmar/forzar (para no bloquear edge cases).

2. Importación CSV contactos (`AIEnhancedBulkUpload` + validators):
- Añadir paso de normalización/corrección de `client_type` por reglas.
- Si hay IA habilitada, usarla solo en filas ambiguas.
- Mostrar preview con badge “reclasificado por reglas/IA”.
- Guardar decisiones en `contact_classification_reviews`.

3. Quantum import:
- Endurecer función `detectEntityType` con patrones más completos.
- Dejar de depender solo de “NIF empieza por letra”.
- Registrar score + motivo para diagnósticos.

Resultado esperado:
- Las nuevas entradas dejan de reintroducir empresas en personas.

Fase 4 — UX de control y operación (que “alimente” de verdad)
1. Nuevo panel ligero en Contactos (o pestaña Migración):
- “Clasificación inteligente” con:
  - Pendientes de revisión
  - Autoaplicadas
  - Rechazadas
  - Botones Aprobar/Revertir en lote
- Filtros por fuente (`manual`, `quantum_auto`, `csv`, `form`).

2. Feedback loop:
- Cuando usuario corrige manualmente una sugerencia, guardar patrón aceptado/rechazado para mejorar reglas futuras (tabla simple de `classification_feedback_patterns` opcional).

3. Métricas:
- `% sospechosos`, `% autocorregidos`, `% aprobados`, `% falsos positivos`.
- Esto permite ajustar reglas sin “adivinar”.

Cambios de código/base de datos propuestos
Base de datos
- Migración 1: saneamiento inicial de contactos mal clasificados.
- Migración 2:
  - tabla `contact_classification_reviews`
  - índices por `org_id`, `status`, `created_at`
  - RLS completa.
- Migración 3 (opcional pero recomendado):
  - unificar triggers duplicados de `validate_person_company_relation` (dejar uno).

Frontend
- `src/hooks/useInfinitePersons.ts`
  - mantener filtro actual (está correcto), opcionalmente añadir exclusión de “sospechosos en revisión pendiente” si negocio lo aprueba.
- `src/components/contacts/PersonFormDialog.tsx` + hooks de submit
  - alerta preventiva antes de guardar.
- `src/components/bulk-upload/AIEnhancedBulkUpload.tsx` + validators/processors
  - clasificación inteligente en preview e import.
- `src/components/quantum/QuantumClientImporter.tsx`
  - mejorar heurística y traza de clasificación.
- Nuevo componente de revisión:
  - `src/components/contacts/ClassificationReviewPanel.tsx` (o sección en `MigrationDashboard`).

Edge Function IA
- `supabase/functions/ai-bulk-validate/index.ts`
  - migrar de `OPENAI_API_KEY` a `LOVABLE_API_KEY` + gateway Lovable AI.
  - manejo explícito de 402/429 para mostrar toasts correctos.

Riesgos y mitigaciones
1. Falsos positivos (persona con nombre “comercial”):
- Mitigación: autocorrección solo en alta confianza; ambiguos a revisión.

2. Coste/latencia IA:
- Mitigación: IA solo en ambiguos, reglas primero.

3. Cambios masivos de datos:
- Mitigación: migración idempotente + tabla de auditoría + posibilidad de rollback por IDs afectados.

4. Integridad de negocio:
- Mitigación: no bloquear guardado duro en UI al principio; usar confirmación asistida.

Plan de ejecución recomendado (orden)
1. DB saneamiento inicial + tabla de revisión.
2. Prevención en formularios/imports.
3. Endurecer Quantum import.
4. Panel de revisión y métricas.
5. Ajuste fino de reglas con datos reales 1-2 semanas.

Criterios de aceptación
- En `/contacts` > “Personas Físicas”, no aparecen registros evidentes de empresa tras saneamiento.
- Nuevas altas/importaciones con patrón empresarial disparan aviso o corrección.
- Existe trazabilidad de sugerencias y decisiones.
- El usuario puede revisar/revertir reclasificaciones.
- Performance estable (sin degradar listados infinitos).

Validación funcional (E2E) propuesta
1. Crear contacto manual con nombre “ACME S.L.” y tipo “particular”:
- Debe aparecer advertencia y permitir corregir.
2. Importar CSV mixto (personas + empresas mal etiquetadas):
- Debe mostrar preview con reclasificación sugerida.
3. Ejecutar import Quantum:
- Debe clasificar mejor casos LTD/GMBH/SL/SA.
4. Verificar listados:
- “Personas Físicas” limpio.
- “Empresas” contiene los reclasificados.
5. Revisar panel de clasificación:
- aprobar/rechazar y comprobar efecto inmediato.

Notas técnicas clave
- El problema no está en React Query ni en el filtro del listado: está en la semántica de `client_type` persistida.
- La IA debe complementar reglas, no reemplazarlas.
- Conviene abordar trigger duplicado de `contacts` en la misma ventana de cambios para evitar deuda técnica.

Si apruebas, en la implementación lo haría en este orden exacto:
1) migración de saneamiento + tabla de revisión,
2) prevención en formulario/import,
3) mejora de Quantum,
4) panel de revisión,
5) pruebas E2E guiadas en `/contacts`.
