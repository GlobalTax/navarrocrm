-- Add extended deed fields
ALTER TABLE public.deeds
  ADD COLUMN IF NOT EXISTS notary_name varchar NULL,
  ADD COLUMN IF NOT EXISTS protocol_number varchar NULL,
  ADD COLUMN IF NOT EXISTS registry_office varchar NULL,
  ADD COLUMN IF NOT EXISTS registry_reference varchar NULL,
  ADD COLUMN IF NOT EXISTS registry_status varchar NULL,
  ADD COLUMN IF NOT EXISTS registry_submission_date date NULL,
  ADD COLUMN IF NOT EXISTS registration_date date NULL,
  ADD COLUMN IF NOT EXISTS notary_fees numeric NULL,
  ADD COLUMN IF NOT EXISTS registry_fees numeric NULL,
  ADD COLUMN IF NOT EXISTS other_fees numeric NULL,
  ADD COLUMN IF NOT EXISTS total_fees numeric NULL,
  ADD COLUMN IF NOT EXISTS assigned_to uuid NULL REFERENCES public.users(id) ON DELETE SET NULL;

-- Ensure updated_at maintains current behavior if a trigger exists; if not, you may add one later.
