-- Create job offer signatures table
CREATE TABLE public.job_offer_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_offer_id UUID NOT NULL,
  org_id UUID NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  signature_token VARCHAR(255) NOT NULL UNIQUE DEFAULT generate_job_offer_token(),
  signature_data TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  document_url TEXT,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_offer_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for job offer signatures
CREATE POLICY "Users can view their org signatures" 
ON public.job_offer_signatures 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create signatures in their org" 
ON public.job_offer_signatures 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Public can update signatures with valid token" 
ON public.job_offer_signatures 
FOR UPDATE 
USING (signature_token IS NOT NULL AND expires_at > NOW());

-- Create indexes for performance
CREATE INDEX idx_job_offer_signatures_token ON public.job_offer_signatures(signature_token);
CREATE INDEX idx_job_offer_signatures_job_offer_id ON public.job_offer_signatures(job_offer_id);
CREATE INDEX idx_job_offer_signatures_org_id ON public.job_offer_signatures(org_id);

-- Add trigger for updated_at
CREATE TRIGGER update_job_offer_signatures_updated_at
  BEFORE UPDATE ON public.job_offer_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();