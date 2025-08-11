-- 1) Tablas de Escrituras con equipo, etapas (y plantillas) y honorarios
-- Seguridad: RLS por org_id, triggers de updated_at y asignación automática de created_by

-- Función genérica para rellenar created_by si viene nulo
CREATE OR REPLACE FUNCTION public.set_created_by_if_null()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Tabla principal: deeds
CREATE TABLE IF NOT EXISTS public.deeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text NOT NULL,
  deed_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- draft|pending_signature|signed|in_registry|completed
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
  case_id uuid NULL REFERENCES public.cases(id) ON DELETE SET NULL,
  signing_date date NULL,
  notary_office text NULL,
  base_fee numeric NULL,
  currency varchar NOT NULL DEFAULT 'EUR',
  proposal_id uuid NULL REFERENCES public.proposals(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_deeds_org ON public.deeds(org_id);
CREATE INDEX IF NOT EXISTS idx_deeds_contact ON public.deeds(contact_id);
CREATE INDEX IF NOT EXISTS idx_deeds_case ON public.deeds(case_id);
CREATE INDEX IF NOT EXISTS idx_deeds_status ON public.deeds(status);
CREATE INDEX IF NOT EXISTS idx_deeds_type ON public.deeds(deed_type);

-- Triggers
DROP TRIGGER IF EXISTS set_deeds_created_by ON public.deeds;
CREATE TRIGGER set_deeds_created_by
BEFORE INSERT ON public.deeds
FOR EACH ROW EXECUTE FUNCTION public.set_created_by_if_null();

DROP TRIGGER IF EXISTS update_deeds_updated_at ON public.deeds;
CREATE TRIGGER update_deeds_updated_at
BEFORE UPDATE ON public.deeds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.deeds ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='deeds' AND policyname='Users can view deeds from their org'
  ) THEN
    CREATE POLICY "Users can view deeds from their org"
    ON public.deeds FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='deeds' AND policyname='Users can insert deeds in their org'
  ) THEN
    CREATE POLICY "Users can insert deeds in their org"
    ON public.deeds FOR INSERT
    WITH CHECK (org_id = public.get_user_org_id() AND created_by = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='deeds' AND policyname='Users can update deeds in their org'
  ) THEN
    CREATE POLICY "Users can update deeds in their org"
    ON public.deeds FOR UPDATE
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='deeds' AND policyname='Users can delete deeds in their org'
  ) THEN
    CREATE POLICY "Users can delete deeds in their org"
    ON public.deeds FOR DELETE
    USING (org_id = public.get_user_org_id());
  END IF;
END $$;

-- Equipo asignado a la escritura
CREATE TABLE IF NOT EXISTS public.deed_assignees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  deed_id uuid NOT NULL REFERENCES public.deeds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role varchar NOT NULL DEFAULT 'collaborator', -- owner|collaborator
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Dueño único por escritura
CREATE UNIQUE INDEX IF NOT EXISTS uq_deed_owner
ON public.deed_assignees(deed_id)
WHERE role = 'owner';

CREATE INDEX IF NOT EXISTS idx_deed_assignees_org ON public.deed_assignees(org_id);
CREATE INDEX IF NOT EXISTS idx_deed_assignees_deed ON public.deed_assignees(deed_id);
CREATE INDEX IF NOT EXISTS idx_deed_assignees_user ON public.deed_assignees(user_id);

DROP TRIGGER IF EXISTS update_deed_assignees_updated_at ON public.deed_assignees;
CREATE TRIGGER update_deed_assignees_updated_at
BEFORE UPDATE ON public.deed_assignees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.deed_assignees ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_assignees' AND policyname='Users can view deed assignees from their org'
  ) THEN
    CREATE POLICY "Users can view deed assignees from their org"
    ON public.deed_assignees FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_assignees' AND policyname='Users can insert deed assignees in their org'
  ) THEN
    CREATE POLICY "Users can insert deed assignees in their org"
    ON public.deed_assignees FOR INSERT
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_assignees' AND policyname='Users can update deed assignees in their org'
  ) THEN
    CREATE POLICY "Users can update deed assignees in their org"
    ON public.deed_assignees FOR UPDATE
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_assignees' AND policyname='Users can delete deed assignees in their org'
  ) THEN
    CREATE POLICY "Users can delete deed assignees in their org"
    ON public.deed_assignees FOR DELETE
    USING (org_id = public.get_user_org_id());
  END IF;
END $$;

-- Plantillas de etapas por tipo de escritura
CREATE TABLE IF NOT EXISTS public.deed_stage_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  deed_type text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  expected_days int NULL,
  default_due_offset_days int NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, deed_type, code)
);

CREATE INDEX IF NOT EXISTS idx_deed_stage_templates_org ON public.deed_stage_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_deed_stage_templates_type ON public.deed_stage_templates(deed_type);

DROP TRIGGER IF EXISTS update_deed_stage_templates_updated_at ON public.deed_stage_templates;
CREATE TRIGGER update_deed_stage_templates_updated_at
BEFORE UPDATE ON public.deed_stage_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.deed_stage_templates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_stage_templates' AND policyname='Users can manage deed stage templates from their org'
  ) THEN
    CREATE POLICY "Users can manage deed stage templates from their org"
    ON public.deed_stage_templates FOR ALL
    USING (org_id = public.get_user_org_id())
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;
END $$;

-- Etapas instanciadas por escritura
CREATE TABLE IF NOT EXISTS public.deed_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  deed_id uuid NOT NULL REFERENCES public.deeds(id) ON DELETE CASCADE,
  template_id uuid NULL REFERENCES public.deed_stage_templates(id) ON DELETE SET NULL,
  code text NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  due_date date NULL,
  completed_at timestamptz NULL,
  stage_status text NOT NULL DEFAULT 'pending', -- pending|in_progress|done|blocked
  notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deed_stages_org ON public.deed_stages(org_id);
CREATE INDEX IF NOT EXISTS idx_deed_stages_deed ON public.deed_stages(deed_id);
CREATE INDEX IF NOT EXISTS idx_deed_stages_status ON public.deed_stages(stage_status);

DROP TRIGGER IF EXISTS update_deed_stages_updated_at ON public.deed_stages;
CREATE TRIGGER update_deed_stages_updated_at
BEFORE UPDATE ON public.deed_stages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.deed_stages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_stages' AND policyname='Users can view deed stages from their org'
  ) THEN
    CREATE POLICY "Users can view deed stages from their org"
    ON public.deed_stages FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_stages' AND policyname='Users can manage deed stages from their org'
  ) THEN
    CREATE POLICY "Users can manage deed stages from their org"
    ON public.deed_stages FOR ALL
    USING (org_id = public.get_user_org_id())
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;
END $$;

-- Importes/Honorarios asociados (extras y enlace a propuesta)
CREATE TABLE IF NOT EXISTS public.deed_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  deed_id uuid NOT NULL REFERENCES public.deeds(id) ON DELETE CASCADE,
  concept text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  is_extra boolean NOT NULL DEFAULT false,
  tax_rate numeric NOT NULL DEFAULT 0,
  proposal_id uuid NULL REFERENCES public.proposals(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deed_fees_org ON public.deed_fees(org_id);
CREATE INDEX IF NOT EXISTS idx_deed_fees_deed ON public.deed_fees(deed_id);

DROP TRIGGER IF EXISTS update_deed_fees_updated_at ON public.deed_fees;
CREATE TRIGGER update_deed_fees_updated_at
BEFORE UPDATE ON public.deed_fees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.deed_fees ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_fees' AND policyname='Users can view deed fees from their org'
  ) THEN
    CREATE POLICY "Users can view deed fees from their org"
    ON public.deed_fees FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='deed_fees' AND policyname='Users can manage deed fees from their org'
  ) THEN
    CREATE POLICY "Users can manage deed fees from their org"
    ON public.deed_fees FOR ALL
    USING (org_id = public.get_user_org_id())
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;
END $$;
