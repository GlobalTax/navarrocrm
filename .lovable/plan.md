
Objetivo: dejar estable la sincronización de Quantum (que ahora devuelve errores masivos) y alinear la clasificación personas/empresas entre importación manual y sincronización automática.

## Hallazgos confirmados (con datos reales)

1) La sincronización automática sí se ejecuta, pero falla para todos los registros:
- En `net._http_response` (id 8166, 2026-03-01 05:00) la respuesta fue:
  - `total_customers: 1365`
  - `imported: 0`
  - `skipped: 0`
  - `errors: 1365`
- Por eso en `quantum_sync_notifications` aparecen estados `partial` con `0/0`.

2) El estado `partial` no se refleja bien en UI:
- `QuantumSyncStatus.tsx` tipa `status` como `'success' | 'error'`.
- Cuando llega `partial`, se muestra como “Pendiente”, generando confusión.

3) Hay desalineación entre clasificadores:
- Importación manual usa `detectCompanyPattern` (más completo).
- Edge function `quantum-clients` usa `detectEntityType` propio (distinto y menos robusto), por eso sigue habiendo inconsistencias de clasificación según el flujo usado.

4) El historial de sync puede perder trazabilidad:
- `quantum_sync_history.status` tiene check `success|error|in_progress`.
- La edge function intenta registrar `partial`, y esa inserción puede fallar silenciosamente (ahora no se valida el error del insert).

---

## Implementación propuesta

### Fase 1 — Arreglar base de datos para soportar upsert y estados parciales
Archivo nuevo: migración SQL en `supabase/migrations/...sql`

1. Ajustar unicidad para `upsert` robusto por `org_id + quantum_customer_id`:
- Crear índice/constraint único no ambiguo para conflicto:
  - `(org_id, quantum_customer_id)` (manteniendo nulls permitidos).
- Eliminar o reemplazar el índice parcial actual `idx_contacts_quantum_unique` si interfiere con inferencia de `ON CONFLICT`.
- Antes de aplicar, validar que no haya duplicados reales (ya revisado: no hay duplicados no nulos).

2. Permitir estado `partial` en historial:
- Ampliar check de `quantum_sync_history.status` para incluir `partial`.

Resultado de esta fase:
- El `upsert` deja de fallar por conflicto estructural.
- El historial acepta ejecuciones parciales sin romper trazabilidad.

---

### Fase 2 — Endurecer `quantum-clients` para no caer en “todo el batch falla”
Archivo: `supabase/functions/quantum-clients/index.ts`

1. Unificar clasificación:
- Sustituir `detectEntityType` actual por una versión equivalente a `detectCompanyPattern` (misma semántica: empresa, confianza, junk).
- En edge function, marcar junk como `status: 'inactivo'` para no contaminar personas activas.

2. Validación mínima antes de upsert:
- Omitir (y contar como skipped) filas sin `customerId` o sin `name`.
- Normalizar `customerId` a string consistente.

3. Upsert resiliente:
- Mantener batches de 100.
- Si un batch falla, fallback a procesamiento fila-a-fila para:
  - salvar registros válidos,
  - aislar registros erróneos,
  - evitar `0 importados` global.
- Capturar y acumular los primeros errores técnicos (ej. 20) para diagnóstico.

4. Mejor registro y respuesta:
- Guardar en `quantum_sync_notifications.error_message` un resumen útil cuando `errors > 0`.
- Incluir en response `error_samples` (limitado) para depuración.
- Validar errores de `insert` en `quantum_sync_history` y loguearlos explícitamente (sin silencios).

Resultado de esta fase:
- Aunque existan registros conflictivos, la sync ya no se bloquea completa.
- Tendremos visibilidad del motivo exacto cuando algo falle.

---

### Fase 3 — Corregir UX de estado y mensaje en Contactos
Archivo: `src/components/contacts/QuantumSyncStatus.tsx`

1. Soportar `partial` en tipo y render:
- `status: 'success' | 'error' | 'partial'`.
- Badge y copy explícitos para parcial (no “Pendiente”).

2. Mensajes de resultado más claros:
- Mostrar en toast y tarjeta: importados/actualizados, omitidos y errores.
- Actualizar texto informativo:
  - de “duplicados se omiten”
  - a “duplicados se actualizan vía upsert”.

Resultado de esta fase:
- El usuario verá el estado real de la sync y no un falso “pendiente”.

---

### Fase 4 — Alinear clasificación también en el flujo modal de importación
Archivos:
- `src/components/quantum/QuantumClientImporter.tsx`
- `src/components/contacts/QuantumImportDialog.tsx` (si aplica)

1. En importador, separar visualmente por tipo detectado (empresa/persona) y junk:
- En modo `clients`, priorizar personas.
- En modo `companies`, priorizar empresas.
- Junk marcado y no seleccionado por defecto.

2. En el modal desde `/contacts`, revisar flujo para no inducir mezcla:
- O añadir tabs clientes/empresas dentro del modal,
- o redirigir al flujo `/quantum/import` (que ya tiene tabs).

Resultado de esta fase:
- Se reduce la percepción de “empresas en personas” durante importación.

---

## Validación (QA) tras implementar

1. Sync automática/manual:
- Ejecutar “Sincronizar ahora” desde Contactos.
- Verificar respuesta con `imported > 0` (o al menos >0 en escenarios con cambios), `errors` razonable y no masivo.

2. Verificación en BD:
- `quantum_sync_notifications` debe reflejar importados/errores reales.
- `quantum_sync_history` debe guardar filas con `status='partial'` cuando corresponda.
- `contacts.updated_at` debe moverse tras sync para registros existentes.

3. Clasificación:
- Muestreo de contactos Quantum recientes en personas vs empresas.
- Confirmar que registros junk quedan inactivos y no “ensucian” personas activas.

4. UI:
- Badge de sync en `partial` visible y correcto.
- Copy de tarjeta actualizado (“actualiza duplicados”, no “omite”).

---

## Riesgos y mitigaciones

- Riesgo: cambiar índice único puede impactar inserciones concurrentes.
  - Mitigación: migración transaccional con validación previa de duplicados.

- Riesgo: fallback fila-a-fila aumenta tiempo en corridas con muchos errores.
  - Mitigación: usar fallback solo cuando batch falle; limitar logs de error.

- Riesgo: clasificación demasiado agresiva.
  - Mitigación: conservar umbral de confianza y marcar casos dudosos para revisión, no reclasificar ciegamente.

---

## Archivos previstos para tocar

- `supabase/migrations/<nuevo_timestamp>_quantum_sync_upsert_and_status_fix.sql`
- `supabase/functions/quantum-clients/index.ts`
- `src/components/contacts/QuantumSyncStatus.tsx`
- `src/components/quantum/QuantumClientImporter.tsx` (ajustes de segmentación/classificación en UI)
- `src/components/contacts/QuantumImportDialog.tsx` (si se unifica flujo con tabs)
