-- Crear bucket para documentos de suscripciones pagadas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('outgoing-subscription-documents', 'outgoing-subscription-documents', false);

-- Crear tabla para documentos de suscripciones pagadas
CREATE TABLE public.outgoing_subscription_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  subscription_id UUID NOT NULL REFERENCES public.outgoing_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name CHARACTER VARYING NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type CHARACTER VARYING,
  document_type CHARACTER VARYING NOT NULL DEFAULT 'invoice', -- 'invoice', 'contract', 'receipt', 'other'
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla
ALTER TABLE public.outgoing_subscription_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para documentos de suscripciones
CREATE POLICY "Users can view documents from their org"
ON public.outgoing_subscription_documents
FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create documents in their org"
ON public.outgoing_subscription_documents
FOR INSERT
WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update documents from their org"
ON public.outgoing_subscription_documents
FOR UPDATE
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete documents from their org"
ON public.outgoing_subscription_documents
FOR DELETE
USING (org_id = get_user_org_id());

-- Políticas de storage para el bucket de documentos
CREATE POLICY "Users can view documents from their org"
ON storage.objects
FOR SELECT
USING (bucket_id = 'outgoing-subscription-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'outgoing-subscription-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'outgoing-subscription-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'outgoing-subscription-documents' AND auth.uid() IS NOT NULL);

-- Crear trigger para updated_at
CREATE TRIGGER update_outgoing_subscription_documents_updated_at
  BEFORE UPDATE ON public.outgoing_subscription_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_outgoing_subscription_documents_subscription_id 
ON public.outgoing_subscription_documents(subscription_id);

CREATE INDEX idx_outgoing_subscription_documents_org_id 
ON public.outgoing_subscription_documents(org_id);

CREATE INDEX idx_outgoing_subscription_documents_document_type 
ON public.outgoing_subscription_documents(document_type);