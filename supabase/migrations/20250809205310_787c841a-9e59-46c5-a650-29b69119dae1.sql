-- Document e-signature (propia) schema and storage setup

-- 1) Table: document_signatures
CREATE TABLE IF NOT EXISTS public.document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.generated_documents(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'internal',
  envelope_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','completed','declined','expired')),
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  audit_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  requested_by UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_signatures_org ON public.document_signatures(org_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_document ON public.document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_status ON public.document_signatures(status);

-- Trigger to auto-update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_document_signatures_updated_at'
  ) THEN
    CREATE TRIGGER trg_document_signatures_updated_at
    BEFORE UPDATE ON public.document_signatures
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Set requested_by to auth.uid() if null on insert
CREATE OR REPLACE FUNCTION public.set_requested_by_if_null()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.requested_by IS NULL THEN
    NEW.requested_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_document_signatures_requested_by'
  ) THEN
    CREATE TRIGGER trg_document_signatures_requested_by
    BEFORE INSERT ON public.document_signatures
    FOR EACH ROW EXECUTE FUNCTION public.set_requested_by_if_null();
  END IF;
END$$;

-- Enable RLS and policies for document_signatures
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can select document_signatures' AND tablename = 'document_signatures'
  ) THEN
    CREATE POLICY "org members can select document_signatures"
    ON public.document_signatures
    FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can insert document_signatures' AND tablename = 'document_signatures'
  ) THEN
    CREATE POLICY "org members can insert document_signatures"
    ON public.document_signatures
    FOR INSERT
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can update document_signatures' AND tablename = 'document_signatures'
  ) THEN
    CREATE POLICY "org members can update document_signatures"
    ON public.document_signatures
    FOR UPDATE
    USING (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can delete document_signatures' AND tablename = 'document_signatures'
  ) THEN
    CREATE POLICY "org members can delete document_signatures"
    ON public.document_signatures
    FOR DELETE
    USING (org_id = public.get_user_org_id());
  END IF;
END$$;

-- 2) Table: document_signature_tokens
CREATE TABLE IF NOT EXISTS public.document_signature_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_signature_id UUID NOT NULL REFERENCES public.document_signatures(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signature_tokens_signature ON public.document_signature_tokens(document_signature_id);
CREATE INDEX IF NOT EXISTS idx_signature_tokens_expires ON public.document_signature_tokens(expires_at);

ALTER TABLE public.document_signature_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Org-based access by joining to document_signatures
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can select signature_tokens' AND tablename = 'document_signature_tokens'
  ) THEN
    CREATE POLICY "org members can select signature_tokens"
    ON public.document_signature_tokens
    FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.document_signatures s
      WHERE s.id = document_signature_id
      AND s.org_id = public.get_user_org_id()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can insert signature_tokens' AND tablename = 'document_signature_tokens'
  ) THEN
    CREATE POLICY "org members can insert signature_tokens"
    ON public.document_signature_tokens
    FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.document_signatures s
      WHERE s.id = document_signature_id
      AND s.org_id = public.get_user_org_id()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can update signature_tokens' AND tablename = 'document_signature_tokens'
  ) THEN
    CREATE POLICY "org members can update signature_tokens"
    ON public.document_signature_tokens
    FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM public.document_signatures s
      WHERE s.id = document_signature_id
      AND s.org_id = public.get_user_org_id()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'org members can delete signature_tokens' AND tablename = 'document_signature_tokens'
  ) THEN
    CREATE POLICY "org members can delete signature_tokens"
    ON public.document_signature_tokens
    FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM public.document_signatures s
      WHERE s.id = document_signature_id
      AND s.org_id = public.get_user_org_id()
    ));
  END IF;
END$$;

-- 3) Add signed file path to generated_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'generated_documents' AND column_name = 'file_path_signed'
  ) THEN
    ALTER TABLE public.generated_documents ADD COLUMN file_path_signed TEXT;
  END IF;
END$$;

-- 4) Storage bucket for signed documents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'signed-documents') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('signed-documents', 'signed-documents', false);
  END IF;
END$$;

-- 4a) RLS policies for accessing signed documents by org folder convention
-- Expect object name like: <org_id>/<document_id>/signed.pdf
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Signed docs read by org' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Signed docs read by org"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'signed-documents'
      AND (storage.foldername(name))[1] = public.get_user_org_id()::text
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Signed docs insert by org' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Signed docs insert by org"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'signed-documents'
      AND (storage.foldername(name))[1] = public.get_user_org_id()::text
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Signed docs update by org' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Signed docs update by org"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'signed-documents'
      AND (storage.foldername(name))[1] = public.get_user_org_id()::text
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Signed docs delete by org' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Signed docs delete by org"
    ON storage.objects
    FOR DELETE
    USING (
      bucket_id = 'signed-documents'
      AND (storage.foldername(name))[1] = public.get_user_org_id()::text
    );
  END IF;
END$$;