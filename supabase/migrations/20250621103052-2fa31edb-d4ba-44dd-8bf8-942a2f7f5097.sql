
-- Expand the cases table with additional fields for comprehensive matter management
ALTER TABLE public.cases 
ADD COLUMN practice_area VARCHAR(100),
ADD COLUMN responsible_solicitor_id UUID REFERENCES public.users(id),
ADD COLUMN originating_solicitor_id UUID REFERENCES public.users(id),
ADD COLUMN matter_number VARCHAR(50) UNIQUE,
ADD COLUMN billing_method VARCHAR(50) DEFAULT 'hourly',
ADD COLUMN estimated_budget DECIMAL(10,2),
ADD COLUMN date_opened DATE DEFAULT CURRENT_DATE,
ADD COLUMN date_closed DATE,
ADD COLUMN template_id UUID;

-- Create practice areas table
CREATE TABLE public.practice_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create matter templates table
CREATE TABLE public.matter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  practice_area_id UUID REFERENCES public.practice_areas(id),
  default_billing_method VARCHAR(50) DEFAULT 'hourly',
  template_data JSONB,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create matter stages table
CREATE TABLE public.matter_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create matter permissions table
CREATE TABLE public.matter_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission_type VARCHAR(50) NOT NULL, -- 'view', 'edit', 'admin'
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(case_id, user_id)
);

-- Create matter notifications table
CREATE TABLE public.matter_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'email', 'dashboard', 'both'
  event_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'stage_completed', etc.
  is_enabled BOOLEAN DEFAULT true,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(case_id, user_id, event_type)
);

-- Add foreign key for template_id in cases table
ALTER TABLE public.cases 
ADD CONSTRAINT cases_template_id_fkey 
FOREIGN KEY (template_id) REFERENCES public.matter_templates(id);

-- Create function to generate matter numbers
CREATE OR REPLACE FUNCTION generate_matter_number(org_uuid UUID)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INT;
  matter_count INT;
  matter_number VARCHAR(50);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Count existing matters for this year and org
  SELECT COUNT(*) INTO matter_count
  FROM public.cases 
  WHERE org_id = org_uuid 
  AND EXTRACT(YEAR FROM date_opened) = current_year;
  
  -- Generate matter number: YYYY-NNNN format
  matter_number := current_year || '-' || LPAD((matter_count + 1)::TEXT, 4, '0');
  
  RETURN matter_number;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE public.practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for practice_areas
CREATE POLICY "Users can view practice areas in their org" 
  ON public.practice_areas FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage practice areas in their org" 
  ON public.practice_areas FOR ALL 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Create RLS policies for matter_templates
CREATE POLICY "Users can view templates in their org" 
  ON public.matter_templates FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage templates in their org" 
  ON public.matter_templates FOR ALL 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Create RLS policies for matter_stages
CREATE POLICY "Users can view stages in their org" 
  ON public.matter_stages FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage stages in their org" 
  ON public.matter_stages FOR ALL 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Create RLS policies for matter_permissions
CREATE POLICY "Users can view permissions in their org" 
  ON public.matter_permissions FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage permissions in their org" 
  ON public.matter_permissions FOR ALL 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Create RLS policies for matter_notifications
CREATE POLICY "Users can view notifications in their org" 
  ON public.matter_notifications FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can manage notifications in their org" 
  ON public.matter_notifications FOR ALL 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Insert some default practice areas (common legal areas)
INSERT INTO public.practice_areas (name, description, org_id) 
SELECT 
  area_name,
  area_description,
  o.id
FROM (
  VALUES 
    ('Corporate Law', 'Business formation, contracts, and corporate governance'),
    ('Real Estate', 'Property transactions, leases, and real estate disputes'),
    ('Family Law', 'Divorce, custody, adoption, and family disputes'),
    ('Criminal Defense', 'Criminal cases and defense representation'),
    ('Personal Injury', 'Accidents, medical malpractice, and injury claims'),
    ('Employment Law', 'Workplace disputes, discrimination, and labor issues'),
    ('Immigration', 'Visa applications, citizenship, and immigration matters'),
    ('Estate Planning', 'Wills, trusts, and estate administration'),
    ('Intellectual Property', 'Patents, trademarks, and copyright protection'),
    ('Litigation', 'Civil litigation and dispute resolution')
) AS areas(area_name, area_description)
CROSS JOIN public.organizations o;
