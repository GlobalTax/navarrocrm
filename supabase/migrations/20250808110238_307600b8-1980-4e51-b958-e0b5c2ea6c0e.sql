-- Add department classification to outgoing_subscriptions
-- 1) New column + FK + index
ALTER TABLE public.outgoing_subscriptions
  ADD COLUMN IF NOT EXISTS department_id uuid NULL;

DO $$
BEGIN
  -- Add foreign key if not exists
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'outgoing_subscriptions' AND c.conname = 'outgoing_subscriptions_department_id_fkey'
  ) THEN
    ALTER TABLE public.outgoing_subscriptions
      ADD CONSTRAINT outgoing_subscriptions_department_id_fkey
      FOREIGN KEY (department_id)
      REFERENCES public.departments(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index to speed up filtering by department
CREATE INDEX IF NOT EXISTS idx_outgoing_subscriptions_department_id
  ON public.outgoing_subscriptions(department_id);

-- 2) Validation trigger to enforce org consistency (department belongs to same org)
CREATE OR REPLACE FUNCTION public.validate_outgoing_subscription_department()
RETURNS trigger AS $$
BEGIN
  IF NEW.department_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure the selected department exists and belongs to the same org
  IF NOT EXISTS (
    SELECT 1 FROM public.departments d
    WHERE d.id = NEW.department_id AND d.org_id = NEW.org_id AND d.is_active = true
  ) THEN
    RAISE EXCEPTION 'Departamento no válido para esta organización';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- Attach trigger
DROP TRIGGER IF EXISTS trg_validate_outgoing_subscription_department ON public.outgoing_subscriptions;
CREATE TRIGGER trg_validate_outgoing_subscription_department
BEFORE INSERT OR UPDATE OF department_id, org_id
ON public.outgoing_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.validate_outgoing_subscription_department();