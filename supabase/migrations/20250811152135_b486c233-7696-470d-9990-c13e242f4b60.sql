-- Public Deeds (Escrituras) MVP schema
-- Create table to manage public deeds and their lifecycle integrated with Cases/Contacts

-- 1) Table
CREATE TABLE IF NOT EXISTS public.public_deeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  case_id uuid NULL,
  contact_id uuid NOT NULL,
  deed_type varchar NOT NULL, -- e.g. compraventa, préstamo, poderes, etc.
  title varchar NOT NULL,
  status varchar NOT NULL DEFAULT 'draft', -- draft | notarized | submitted_to_registry | qualification | remedy | registered | rejected | cancelled
  notary_office varchar NULL,
  notary_name varchar NULL,
  protocol_number varchar NULL,
  signing_date timestamptz NULL,
  registry_office varchar NULL,
  registry_submission_date timestamptz NULL,
  qualification_limit_date date NULL, -- plazo legal estimado para calificación/subsanación
  registration_date timestamptz NULL,
  registry_entry jsonb NOT NULL DEFAULT '{}', -- datos como tomo/libro/folio/asiento
  notary_fees numeric NULL,
  registry_fees numeric NULL,
  other_fees numeric NULL,
  total_fees numeric NULL,
  assigned_to uuid NULL,
  created_by uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_public_deeds_org ON public.public_deeds (org_id);
CREATE INDEX IF NOT EXISTS idx_public_deeds_case ON public.public_deeds (case_id);
CREATE INDEX IF NOT EXISTS idx_public_deeds_contact ON public.public_deeds (contact_id);
CREATE INDEX IF NOT EXISTS idx_public_deeds_status ON public.public_deeds (status);
CREATE INDEX IF NOT EXISTS idx_public_deeds_signing_date ON public.public_deeds (signing_date);

-- 3) RLS
ALTER TABLE public.public_deeds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view deeds" ON public.public_deeds;
DROP POLICY IF EXISTS "Org members can insert deeds" ON public.public_deeds;
DROP POLICY IF EXISTS "Org members can update deeds" ON public.public_deeds;
DROP POLICY IF EXISTS "Org members can delete deeds" ON public.public_deeds;

CREATE POLICY "Org members can view deeds"
ON public.public_deeds
FOR SELECT
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can insert deeds"
ON public.public_deeds
FOR INSERT
TO authenticated
WITH CHECK (
  (org_id = public.get_user_org_id() AND created_by = auth.uid()) OR public.is_super_admin()
);

CREATE POLICY "Org members can update deeds"
ON public.public_deeds
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
)
WITH CHECK (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

CREATE POLICY "Org members can delete deeds"
ON public.public_deeds
FOR DELETE
TO authenticated
USING (
  org_id = public.get_user_org_id() OR public.is_super_admin()
);

-- 4) Timestamps trigger
DROP TRIGGER IF EXISTS update_public_deeds_updated_at ON public.public_deeds;
CREATE TRIGGER update_public_deeds_updated_at
BEFORE UPDATE ON public.public_deeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();