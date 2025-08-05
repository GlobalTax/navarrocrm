-- Sistema completo de reclutamiento + onboarding

-- Tabla de candidatos
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  linkedin_url TEXT,
  cv_file_path TEXT,
  cover_letter TEXT,
  current_position VARCHAR,
  current_company VARCHAR,
  years_experience INTEGER DEFAULT 0,
  expected_salary NUMERIC,
  salary_currency VARCHAR DEFAULT 'EUR',
  availability_date DATE,
  status VARCHAR NOT NULL DEFAULT 'new', -- new, screening, interviewing, offer_sent, hired, rejected, withdrawn
  source VARCHAR DEFAULT 'manual', -- manual, linkedin, job_board, referral, website
  notes TEXT,
  skills TEXT[],
  languages TEXT[],
  location VARCHAR,
  remote_work_preference VARCHAR DEFAULT 'hybrid', -- onsite, remote, hybrid
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Tabla de entrevistas
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE SET NULL,
  interviewer_id UUID NOT NULL,
  interview_type VARCHAR NOT NULL DEFAULT 'technical', -- technical, cultural, management, hr
  status VARCHAR NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location VARCHAR,
  meeting_url TEXT,
  interview_round INTEGER DEFAULT 1,
  evaluation_score INTEGER, -- 1-5 scale
  evaluation_notes TEXT,
  technical_assessment JSONB,
  cultural_fit_notes TEXT,
  strengths TEXT[],
  concerns TEXT[],
  recommendation VARCHAR, -- hire, no_hire, maybe, next_round
  feedback_shared_with_candidate BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Tabla de procesos de reclutamiento
CREATE TABLE public.recruitment_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  position_title VARCHAR NOT NULL,
  department VARCHAR,
  hiring_manager_id UUID,
  recruiter_id UUID,
  status VARCHAR NOT NULL DEFAULT 'active', -- active, on_hold, completed, cancelled
  priority VARCHAR DEFAULT 'medium', -- low, medium, high, urgent
  target_start_date DATE,
  current_stage VARCHAR DEFAULT 'initial_screening', -- initial_screening, phone_interview, technical_test, in_person_interview, reference_check, offer_stage, hired
  stage_deadline DATE,
  notes TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Tabla de feedback de entrevistas
CREATE TABLE public.interview_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL, -- 1-5 scale
  technical_skills_rating INTEGER,
  communication_rating INTEGER,
  cultural_fit_rating INTEGER,
  experience_level_rating INTEGER,
  detailed_feedback TEXT,
  would_hire BOOLEAN,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar columna process_id a job_offers para conectar con recruitment_processes
ALTER TABLE public.job_offers 
ADD COLUMN recruitment_process_id UUID REFERENCES public.recruitment_processes(id) ON DELETE SET NULL;

-- Agregar columna para conectar job_offers con candidates
ALTER TABLE public.job_offers 
ADD COLUMN candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL;

-- Índices para mejorar performance
CREATE INDEX idx_candidates_org_id ON public.candidates(org_id);
CREATE INDEX idx_candidates_status ON public.candidates(status);
CREATE INDEX idx_candidates_email ON public.candidates(email);
CREATE INDEX idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);
CREATE INDEX idx_recruitment_processes_org_id ON public.recruitment_processes(org_id);
CREATE INDEX idx_recruitment_processes_status ON public.recruitment_processes(status);
CREATE INDEX idx_interview_feedback_interview_id ON public.interview_feedback(interview_id);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruitment_processes_updated_at
  BEFORE UPDATE ON public.recruitment_processes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_feedback_updated_at
  BEFORE UPDATE ON public.interview_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para candidates
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view candidates from their org"
  ON public.candidates FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create candidates in their org"
  ON public.candidates FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update candidates in their org"
  ON public.candidates FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete candidates in their org"
  ON public.candidates FOR DELETE
  USING (org_id = get_user_org_id());

-- RLS Policies para interviews
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interviews from their org"
  ON public.interviews FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create interviews in their org"
  ON public.interviews FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update interviews in their org"
  ON public.interviews FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete interviews in their org"
  ON public.interviews FOR DELETE
  USING (org_id = get_user_org_id());

-- RLS Policies para recruitment_processes
ALTER TABLE public.recruitment_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recruitment processes from their org"
  ON public.recruitment_processes FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create recruitment processes in their org"
  ON public.recruitment_processes FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update recruitment processes in their org"
  ON public.recruitment_processes FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete recruitment processes in their org"
  ON public.recruitment_processes FOR DELETE
  USING (org_id = get_user_org_id());

-- RLS Policies para interview_feedback
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interview feedback from their org"
  ON public.interview_feedback FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create interview feedback in their org"
  ON public.interview_feedback FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND interviewer_id = auth.uid());

CREATE POLICY "Users can update their own interview feedback"
  ON public.interview_feedback FOR UPDATE
  USING (org_id = get_user_org_id() AND interviewer_id = auth.uid());

-- Función para automatizar el proceso: candidato contratado → onboarding
CREATE OR REPLACE FUNCTION public.auto_create_employee_onboarding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Cuando una job_offer cambia a 'accepted', crear automáticamente el employee_onboarding
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' AND NEW.candidate_id IS NOT NULL THEN
    
    -- Verificar si ya existe un onboarding para este candidato
    IF NOT EXISTS (
      SELECT 1 FROM public.employee_onboarding 
      WHERE job_offer_id = NEW.id
    ) THEN
      
      -- Crear el registro de onboarding automáticamente
      INSERT INTO public.employee_onboarding (
        org_id,
        job_offer_id,
        email,
        position_title,
        department_id,
        token,
        status,
        current_step,
        expires_at
      )
      SELECT 
        NEW.org_id,
        NEW.id,
        NEW.candidate_email,
        NEW.title,
        d.id, -- department_id si existe
        public.generate_onboarding_token(),
        'pending',
        1,
        now() + INTERVAL '7 days'
      FROM public.candidates c
      LEFT JOIN public.departments d ON d.name = NEW.department AND d.org_id = NEW.org_id
      WHERE c.id = NEW.candidate_id;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para automatizar el proceso
CREATE TRIGGER auto_create_employee_onboarding_trigger
  AFTER UPDATE ON public.job_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_employee_onboarding();