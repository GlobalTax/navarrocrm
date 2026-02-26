
Objetivo inmediato
- Dejar operativa la importación desde Quantum (ahora está bloqueada).
- Terminar de limpiar empresas que aún aparecen en “Personas Físicas”.
- Evitar que vuelva a pasar en próximas sincronizaciones/importaciones.

Diagnóstico confirmado (con evidencia)
1) Error funcional real (bloqueante)
- La importación Quantum falla por validación de tipos en frontend:
  - `src/lib/quantum/validation.ts` exige `regid: z.string()`.
  - Quantum devuelve `regid` numérico en múltiples registros.
  - Resultado: casi todos los seleccionados fallan con `Invalid input: expected string, received number`.
- Consecuencia: `contactsData.length === 0` y se lanza `QuantumError: No hay contactos válidos para importar`.

2) Problema residual de clasificación
- El filtro del listado de personas funciona (consulta por `client_type in ('particular','autonomo')`).
- Quedan contactos mal clasificados por huecos en patrones (ej. `B.V.` / `BV`):
  - Ejemplos detectados en DB: `3WEBAPPS B.V.`, `BV SPARK LEGAL AND POLICY CONS`.
- La RPC `detect_misclassified_contacts` no los detecta porque no contempla esos sufijos.

3) Ruido de consola que NO es la causa
- 403 de `api.lovable.dev/.../gitsync`, warnings CSP de Tailwind CDN, `osano.js` y `frame-ancestors` no provienen del código de tu app.
- Son warnings del entorno/iframe/editor y no explican el fallo de importación de Quantum.

Plan de implementación propuesto

Fase 1 — Hotfix de importación Quantum (prioridad alta)
1. Robustecer validación y normalización de payload Quantum
- Archivo: `src/lib/quantum/validation.ts`
- Cambios:
  - Permitir y normalizar campos string-like que llegan como número (`regid`, potencialmente `customerId`, `streetNumber`, etc.).
  - Usar coerción/preprocess para convertir number -> string antes de validar.
  - Mantener reglas de negocio (email válido o vacío, name requerido, etc.).
- Resultado esperado:
  - Dejar de rechazar registros válidos por tipado.

2. Consumir el dato normalizado tras `safeParse`
- Archivo: `src/components/quantum/QuantumClientImporter.tsx`
- Cambios:
  - En vez de usar el `customer` crudo, usar `customerValidation.data` (ya normalizado).
  - Mejorar mensaje de error por fila incluyendo campo (`path`) para diagnóstico real (no solo texto genérico).
- Resultado esperado:
  - Importación parcial/total funcional incluso con datos heterogéneos de Quantum.

Fase 2 — Completar clasificación de empresas residuales
1. Ampliar heurística de empresa
- Archivo: `src/lib/contactClassification.ts`
- Añadir patrones de formas jurídicas internacionales faltantes (mínimo `B.V.`/`BV`; opcionalmente `SAS`, `SRL`, `SLP` según política).
- Mantener score de confianza alto para sufijos jurídicos claros.

2. Alinear SQL de detección con la misma lógica
- Archivo: nueva migración SQL (en `supabase/migrations/...`)
- Actualizar función `detect_misclassified_contacts` para incluir los nuevos sufijos.
- Aplicar saneamiento puntual e idempotente para contactos de alta confianza que queden en `particular/autonomo`.

3. Fortalecer detección en origen Quantum
- Archivo: `supabase/functions/quantum-clients/index.ts`
- Extender `detectEntityType` con los mismos patrones para que entren bien clasificados desde el inicio.

Fase 3 — Hardening y consistencia
1. Evitar deriva de reglas entre frontend/DB/edge
- Unificar catálogo de patrones (misma semántica en:
  - `contactClassification.ts`
  - RPC SQL `detect_misclassified_contacts`
  - `detectEntityType` de edge function)

2. (Recomendado) Normalizar triggers duplicados en `contacts`
- En DB hay dos triggers de validación relacionados:
  - `trigger_validate_person_company_relation`
  - `validate_person_company_relation_trigger`
- Consolidar a uno para evitar comportamiento duplicado y deuda técnica.

Validación funcional (E2E) tras implementación
1. Quantum import
- Seleccionar lote grande desde Quantum.
- Verificar que no aparece el error masivo de “expected string, received number”.
- Confirmar inserciones reales en `contacts` y toast de éxito con conteo correcto.

2. Clasificación residual
- Ejecutar “Detectar mal clasificados” en panel.
- Confirmar que registros tipo `B.V./BV` aparecen y se reclasifican.
- Verificar en `/contacts` que dejan de verse en “Personas Físicas” y pasan a “Empresas”.

3. Regresión
- Alta manual de persona no empresa: sin falsas alarmas.
- Alta con nombre empresarial evidente: warning de prevención sigue funcionando.

Archivos a tocar
- `src/lib/quantum/validation.ts`
- `src/components/quantum/QuantumClientImporter.tsx`
- `src/lib/contactClassification.ts`
- `supabase/functions/quantum-clients/index.ts`
- `supabase/migrations/<nueva_migracion_detect_misclassified_y_saneamiento>.sql`
- (Opcional hardening) `supabase/migrations/<nueva_migracion_unificar_trigger>.sql`

Criterios de aceptación
- Importación Quantum deja de bloquearse por errores de tipo.
- Se importan contactos válidos correctamente desde el mismo flujo actual.
- No quedan empresas evidentes en listado de personas por sufijos `B.V./BV` (ni otros añadidos).
- Los warnings de consola externos pueden seguir apareciendo, pero ya no afectan la funcionalidad de negocio.
