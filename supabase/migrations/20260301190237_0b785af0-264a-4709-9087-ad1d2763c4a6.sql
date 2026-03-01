ALTER TABLE public.proposal_line_items
  ADD COLUMN IF NOT EXISTS discount_type varchar DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

ALTER TABLE public.proposal_line_items
  ADD CONSTRAINT proposal_line_items_discount_type_check
  CHECK (discount_type IS NULL OR discount_type IN ('percentage', 'fixed'));