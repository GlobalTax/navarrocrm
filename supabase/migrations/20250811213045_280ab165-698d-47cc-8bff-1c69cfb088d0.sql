-- 1) Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Base: ajustes en deeds y vista expedientes
ALTER TABLE public.deeds
  ADD COLUMN IF NOT EXISTS registry_entry_number text;

-- Índices solicitados (mapeados a columnas reales de deeds)
CREATE INDEX IF NOT EXISTS idx_deeds_estado ON public.deeds (status);
CREATE INDEX IF NOT EXISTS idx_deeds_presentacion ON public.deeds (registry_submission_date);
CREATE INDEX IF NOT EXISTS idx_deeds_asiento_caducidad ON public.deeds (asiento_expiration_date);
CREATE INDEX IF NOT EXISTS idx_deeds_calificacion_limite ON public.deeds (qualification_deadline);

-- Vista de compatibilidad segun el modelo solicitado
DROP VIEW IF EXISTS public.expedientes;
CREATE OR REPLACE VIEW public.expedientes AS
SELECT
  d.id,
  d.contact_id                         AS cliente_id,
  d.registry_type                      AS registro_tipo,      -- RP | RM
  d.deed_type                          AS acto_tipo,
  d.status                             AS estado,
  d.signing_date::date                 AS firma_notario,
  d.model600_deadline                  AS impuestos_limite,
  d.registry_submission_date           AS presentacion,
  d.registry_entry_number              AS asiento_num,
  d.asiento_expiration_date            AS asiento_caducidad,
  d.qualification_deadline             AS calificacion_limite,
  d.registration_date                  AS inscripcion
FROM public.deeds d;

-- 3) Tablas auxiliares
-- 3.1 expedientes_tributos (1:1)
CREATE TABLE IF NOT EXISTS public.expedientes_tributos (
  expediente_id uuid PRIMARY KEY REFERENCES public.deeds(id) ON DELETE CASCADE,
  itp_ajd_procede boolean NOT NULL DEFAULT false,
  itp_ajd_modalidad varchar,
  itp_ajd_pdf text,
  itp_ajd_fecha date,
  iivtnu_procede boolean NOT NULL DEFAULT false,
  iivtnu_tipo varchar,
  iivtnu_pdf text,
  iivtnu_fecha date,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expedientes_tributos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expedientes_tributos'
  ) THEN
    -- limpiar políticas para recrearlas de forma determinista
    DROP POLICY IF EXISTS "exped_tributos_select_org" ON public.expedientes_tributos;
    DROP POLICY IF EXISTS "exped_tributos_insert_org" ON public.expedientes_tributos;
    DROP POLICY IF EXISTS "exped_tributos_update_org" ON public.expedientes_tributos;
    DROP POLICY IF EXISTS "exped_tributos_delete_org" ON public.expedientes_tributos;
  END IF;
END$$;

CREATE POLICY "exped_tributos_select_org" ON public.expedientes_tributos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_tributos_insert_org" ON public.expedientes_tributos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "exped_tributos_update_org" ON public.expedientes_tributos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_tributos_delete_org" ON public.expedientes_tributos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_expedientes_tributos_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_expedientes_tributos_updated_at ON public.expedientes_tributos;
CREATE TRIGGER trg_expedientes_tributos_updated_at
BEFORE UPDATE ON public.expedientes_tributos
FOR EACH ROW EXECUTE FUNCTION public.update_expedientes_tributos_updated_at();

-- 3.2 expedientes_calificacion (1:1)
CREATE TABLE IF NOT EXISTS public.expedientes_calificacion (
  expediente_id uuid PRIMARY KEY REFERENCES public.deeds(id) ON DELETE CASCADE,
  resultado varchar NOT NULL CHECK (resultado IN ('positiva','negativa')),
  nota_pdf text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expedientes_calificacion ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expedientes_calificacion'
  ) THEN
    DROP POLICY IF EXISTS "exped_calif_select_org" ON public.expedientes_calificacion;
    DROP POLICY IF EXISTS "exped_calif_insert_org" ON public.expedientes_calificacion;
    DROP POLICY IF EXISTS "exped_calif_update_org" ON public.expedientes_calificacion;
    DROP POLICY IF EXISTS "exped_calif_delete_org" ON public.expedientes_calificacion;
  END IF;
END$$;

CREATE POLICY "exped_calif_select_org" ON public.expedientes_calificacion
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_calif_insert_org" ON public.expedientes_calificacion
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "exped_calif_update_org" ON public.expedientes_calificacion
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_calif_delete_org" ON public.expedientes_calificacion
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_expedientes_calificacion_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_expedientes_calificacion_updated_at ON public.expedientes_calificacion;
CREATE TRIGGER trg_expedientes_calificacion_updated_at
BEFORE UPDATE ON public.expedientes_calificacion
FOR EACH ROW EXECUTE FUNCTION public.update_expedientes_calificacion_updated_at();

-- 3.3 expedientes_defectos (1:N)
CREATE TABLE IF NOT EXISTS public.expedientes_defectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_id uuid NOT NULL REFERENCES public.deeds(id) ON DELETE CASCADE,
  codigo text,
  descripcion text,
  subsanacion text,
  responsable uuid NULL,
  estado varchar NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto','cerrado')),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expedientes_defectos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expedientes_defectos'
  ) THEN
    DROP POLICY IF EXISTS "exped_defectos_select_org" ON public.expedientes_defectos;
    DROP POLICY IF EXISTS "exped_defectos_insert_org" ON public.expedientes_defectos;
    DROP POLICY IF EXISTS "exped_defectos_update_org" ON public.expedientes_defectos;
    DROP POLICY IF EXISTS "exped_defectos_delete_org" ON public.expedientes_defectos;
  END IF;
END$$;

CREATE POLICY "exped_defectos_select_org" ON public.expedientes_defectos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_defectos_insert_org" ON public.expedientes_defectos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "exped_defectos_update_org" ON public.expedientes_defectos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_defectos_delete_org" ON public.expedientes_defectos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_expedientes_defectos_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_expedientes_defectos_updated_at ON public.expedientes_defectos;
CREATE TRIGGER trg_expedientes_defectos_updated_at
BEFORE UPDATE ON public.expedientes_defectos
FOR EACH ROW EXECUTE FUNCTION public.update_expedientes_defectos_updated_at();

-- 3.4 expedientes_borme (1:1)
CREATE TABLE IF NOT EXISTS public.expedientes_borme (
  expediente_id uuid PRIMARY KEY REFERENCES public.deeds(id) ON DELETE CASCADE,
  provision_fondos numeric,
  estado varchar NOT NULL DEFAULT 'pte' CHECK (estado IN ('pte','enviado','publicado')),
  enlace_borme text,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expedientes_borme ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expedientes_borme'
  ) THEN
    DROP POLICY IF EXISTS "exped_borme_select_org" ON public.expedientes_borme;
    DROP POLICY IF EXISTS "exped_borme_insert_org" ON public.expedientes_borme;
    DROP POLICY IF EXISTS "exped_borme_update_org" ON public.expedientes_borme;
    DROP POLICY IF EXISTS "exped_borme_delete_org" ON public.expedientes_borme;
  END IF;
END$$;

CREATE POLICY "exped_borme_select_org" ON public.expedientes_borme
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_borme_insert_org" ON public.expedientes_borme
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "exped_borme_update_org" ON public.expedientes_borme
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

CREATE POLICY "exped_borme_delete_org" ON public.expedientes_borme
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.deeds d
    WHERE d.id = expediente_id AND d.org_id = get_user_org_id()
  )
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_expedientes_borme_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_expedientes_borme_updated_at ON public.expedientes_borme;
CREATE TRIGGER trg_expedientes_borme_updated_at
BEFORE UPDATE ON public.expedientes_borme
FOR EACH ROW EXECUTE FUNCTION public.update_expedientes_borme_updated_at();
