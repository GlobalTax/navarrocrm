-- Create table for document uploads tracking
CREATE TABLE public.employee_document_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES employee_onboarding(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  upload_status TEXT NOT NULL DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploaded', 'failed')),
  document_type TEXT NOT NULL CHECK (document_type IN ('dni', 'cv', 'certificate', 'contract', 'other')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_document_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for document uploads
CREATE POLICY "Users can view their own document uploads" 
ON public.employee_document_uploads 
FOR SELECT 
USING (uploaded_by = auth.uid());

CREATE POLICY "Users can create their own document uploads" 
ON public.employee_document_uploads 
FOR INSERT 
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Org admins can view all document uploads" 
ON public.employee_document_uploads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.org_id = employee_document_uploads.org_id
    AND users.role IN ('partner', 'area_manager')
  )
);

-- Create indexes
CREATE INDEX idx_employee_document_uploads_onboarding_id ON public.employee_document_uploads(onboarding_id);
CREATE INDEX idx_employee_document_uploads_org_id ON public.employee_document_uploads(org_id);
CREATE INDEX idx_employee_document_uploads_uploaded_by ON public.employee_document_uploads(uploaded_by);

-- Create function to update timestamps
CREATE TRIGGER update_employee_document_uploads_updated_at
BEFORE UPDATE ON public.employee_document_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();