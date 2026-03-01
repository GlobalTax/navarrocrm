
Objetivo: corregir definitivamente el error al eliminar propuestas (`23503` sobre `proposal_audit_log_proposal_id_fkey`) sin romper el historial de altas/ediciones.

Diagnóstico confirmado (con evidencia):
1) La petición que falla es el `DELETE /rest/v1/proposals?id=eq...` (HTTP 409).
2) El detalle exacto de BD dice: `Key (proposal_id)=... is not present in table "proposals"`.
3) En BD existe este trigger activo:
   - `proposal_audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.proposals`
4) La función `log_proposal_changes()` inserta siempre en `proposal_audit_log` usando `proposal_id = COALESCE(NEW.id, OLD.id)`.
5) En un `AFTER DELETE`, la propuesta ya no existe; por eso el insert en `proposal_audit_log` viola la FK hacia `proposals`.
6) La FK `proposal_audit_log_proposal_id_fkey` ya está en `ON DELETE CASCADE`; por tanto el problema no es “faltar CASCADE”, sino el intento de insertar auditoría después del borrado.

Plan de implementación (secuenciado):

1. Migración SQL de corrección del trigger (capa backend, arreglo real)
- Crear una nueva migración que:
  - Elimine triggers antiguos por ambos nombres (para evitar residuos históricos):
    - `DROP TRIGGER IF EXISTS proposal_audit_trigger ON public.proposals;`
    - `DROP TRIGGER IF EXISTS log_proposal_changes ON public.proposals;`
  - Recree el trigger de auditoría SOLO para `INSERT` y `UPDATE`:
    - `CREATE TRIGGER proposal_audit_trigger AFTER INSERT OR UPDATE ON public.proposals ...`
- Resultado: deja de ejecutarse auditoría automática en `DELETE`, eliminando el fallo FK en todos los borrados (UI, API, SQL).

2. Hardening de la función `log_proposal_changes` (defensa extra)
- Actualizar la función para cortar explícitamente en `DELETE`:
  - Si `TG_OP = 'DELETE'` → `RETURN OLD` sin `INSERT` en `proposal_audit_log`.
- Aunque alguien vuelva a incluir `DELETE` en un trigger en el futuro, no reaparecerá este error.

3. Ajuste en frontend para evitar trabajo inútil al borrar
- En `src/hooks/proposals/useProposalActions.ts`, dentro de `deleteProposal`, quitar el `logProposalAction(..., 'deleted', ...)` previo al borrado.
- Motivo: ese registro se elimina inmediatamente por cascada al borrar la propuesta, así que hoy añade latencia sin valor real.
- Mantener intacto:
  - borrado de `proposal_line_items` (aunque exista cascade, no molesta),
  - invalidaciones de React Query (`proposals`, `proposal-history`),
  - toasts de éxito/error.

4. Verificación técnica después de aplicar
- Validar en BD:
  - `SELECT pg_get_triggerdef(...)` y confirmar que `proposal_audit_trigger` ya no contiene `DELETE`.
- Validar en UI:
  - Eliminar una propuesta en `/proposals` y comprobar:
    - sin toast de error,
    - lista refrescada correctamente.
- Validar que sigue habiendo auditoría de creación/edición:
  - crear o editar propuesta y confirmar entradas en `proposal_audit_log`.

5. Riesgos/impacto
- Impacto funcional esperado: se soluciona el bloqueo de borrado sin tocar RLS ni estructura de tablas.
- Cambio de comportamiento: ya no habrá evento “deleted” persistido en `proposal_audit_log` (coherente con el modelo actual con FK a `proposals`).
- Si se requiere auditoría histórica de borrados a futuro, se propone fase 2 separada:
  - tabla de auditoría de borrados sin FK dura a `proposals` (o con snapshot en JSON y `proposal_id` sin restricción).

Archivos a modificar:
- Nueva migración SQL en `supabase/migrations/...sql` (trigger + función)
- `src/hooks/proposals/useProposalActions.ts` (eliminar log manual previo al delete)

Criterio de éxito:
- El usuario puede eliminar propuestas sin error 409/23503.
- Continúa funcionando la auditoría automática de INSERT/UPDATE.
- La UI se actualiza al instante tras borrar.
