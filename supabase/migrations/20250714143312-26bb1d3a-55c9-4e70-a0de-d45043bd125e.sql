-- Crear sistema de documentos para onboarding de empleados

-- 1. Tabla para templates de documentos de onboarding
CREATE TABLE public.employee_document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type VARCHAR(100) NOT NULL, -- 'contract', 'handbook', 'policy', 'form'
  template_content TEXT NOT NULL, -- HTML content with variables
  variables JSONB DEFAULT '[]', -- Array of variable definitions
  requires_signature BOOLEAN DEFAULT false,
  signature_fields JSONB DEFAULT '[]', -- Signature field positions
  is_mandatory BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabla para documentos generados por empleado
CREATE TABLE public.employee_onboarding_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.employee_onboarding(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.employee_document_templates(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- Generated HTML content
  pdf_url TEXT, -- URL to generated PDF
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'signed', 'completed'
  requires_signature BOOLEAN DEFAULT false,
  signature_data JSONB, -- Signature information
  signed_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Crear bucket de storage para documentos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false);

-- 4. Políticas de storage para documentos de empleados
CREATE POLICY "Employees can view their own documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can upload employee documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'employee-documents');

CREATE POLICY "System can update employee documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'employee-documents');

-- 5. RLS para templates de documentos
ALTER TABLE public.employee_document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates from their org"
ON public.employee_document_templates
FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage templates in their org"
ON public.employee_document_templates
FOR ALL
USING (org_id = get_user_org_id())
WITH CHECK (org_id = get_user_org_id());

-- 6. RLS para documentos de onboarding
ALTER TABLE public.employee_onboarding_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view onboarding documents from their org"
ON public.employee_onboarding_documents
FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "System can manage onboarding documents"
ON public.employee_onboarding_documents
FOR ALL
USING (org_id = get_user_org_id())
WITH CHECK (org_id = get_user_org_id());

-- 7. Función para generar token de firma
CREATE OR REPLACE FUNCTION public.generate_signature_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$$;

-- 8. Trigger para actualizar updated_at
CREATE TRIGGER update_employee_document_templates_updated_at
  BEFORE UPDATE ON public.employee_document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_onboarding_documents_updated_at
  BEFORE UPDATE ON public.employee_onboarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Índices para rendimiento
CREATE INDEX idx_employee_document_templates_org_id ON public.employee_document_templates(org_id);
CREATE INDEX idx_employee_document_templates_type ON public.employee_document_templates(document_type);
CREATE INDEX idx_employee_onboarding_documents_onboarding_id ON public.employee_onboarding_documents(onboarding_id);
CREATE INDEX idx_employee_onboarding_documents_org_id ON public.employee_onboarding_documents(org_id);
CREATE INDEX idx_employee_onboarding_documents_status ON public.employee_onboarding_documents(status);