-- Crear tablas para el sistema de actividades y timeline

-- Tabla de tipos de actividad (catálogo)
CREATE TABLE public.activity_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR DEFAULT 'activity',
  color VARCHAR DEFAULT '#6366f1',
  category VARCHAR NOT NULL DEFAULT 'general', -- general, hr, evaluation, training, project
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de actividades de empleados
CREATE TABLE public.employee_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  activity_type_id UUID NOT NULL REFERENCES public.activity_types(id),
  title VARCHAR NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  visibility VARCHAR NOT NULL DEFAULT 'internal', -- internal, manager_only, employee_visible
  status VARCHAR NOT NULL DEFAULT 'completed', -- completed, in_progress, scheduled, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de actividades de candidatos  
CREATE TABLE public.candidate_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id),
  activity_type_id UUID NOT NULL REFERENCES public.activity_types(id),
  title VARCHAR NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'completed', -- completed, in_progress, scheduled, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de evaluaciones de empleados
CREATE TABLE public.employee_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  evaluator_id UUID NOT NULL,
  evaluation_period_start DATE NOT NULL,
  evaluation_period_end DATE NOT NULL,
  overall_score NUMERIC(3,2), -- 0.00 to 10.00
  goals_achieved JSONB DEFAULT '[]',
  strengths TEXT,
  areas_for_improvement TEXT,
  development_plan TEXT,
  competencies JSONB DEFAULT '{}', -- {competency: score}
  status VARCHAR NOT NULL DEFAULT 'draft', -- draft, completed, approved
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de formación/cursos de empleados
CREATE TABLE public.employee_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  course_name VARCHAR NOT NULL,
  provider VARCHAR,
  start_date DATE,
  completion_date DATE,
  status VARCHAR NOT NULL DEFAULT 'enrolled', -- enrolled, in_progress, completed, cancelled
  certificate_url TEXT,
  score NUMERIC(5,2),
  credits_earned INTEGER DEFAULT 0,
  cost NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de proyectos de empleados
CREATE TABLE public.employee_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  project_name VARCHAR NOT NULL,
  role VARCHAR,
  start_date DATE,
  end_date DATE,
  status VARCHAR NOT NULL DEFAULT 'active', -- active, completed, paused, cancelled
  description TEXT,
  achievements TEXT,
  skills_used JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de notas de empleados
CREATE TABLE public.employee_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  author_id UUID NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  note_type VARCHAR NOT NULL DEFAULT 'general', -- general, performance, disciplinary, achievement
  is_private BOOLEAN NOT NULL DEFAULT false,
  visibility VARCHAR NOT NULL DEFAULT 'hr_only', -- hr_only, manager_only, all_managers
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de evaluaciones de candidatos
CREATE TABLE public.candidate_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id),
  evaluator_id UUID NOT NULL,
  evaluation_type VARCHAR NOT NULL DEFAULT 'interview', -- interview, technical, cultural, reference
  position VARCHAR,
  overall_score NUMERIC(3,2), -- 0.00 to 10.00
  technical_skills JSONB DEFAULT '{}',
  soft_skills JSONB DEFAULT '{}',
  cultural_fit_score NUMERIC(3,2),
  notes TEXT,
  recommendation VARCHAR NOT NULL DEFAULT 'pending', -- strong_yes, yes, maybe, no, strong_no
  evaluation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de referencias de candidatos
CREATE TABLE public.candidate_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id),
  reference_name VARCHAR NOT NULL,
  reference_position VARCHAR,
  reference_company VARCHAR,
  reference_email VARCHAR,
  reference_phone VARCHAR,
  relationship VARCHAR, -- manager, colleague, client, etc.
  contacted_date TIMESTAMP WITH TIME ZONE,
  response_received BOOLEAN DEFAULT false,
  overall_rating NUMERIC(3,2),
  would_rehire BOOLEAN,
  strengths TEXT,
  weaknesses TEXT,
  additional_notes TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending', -- pending, contacted, completed, declined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_references ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para activity_types (global)
CREATE POLICY "Anyone can view activity types" ON public.activity_types FOR SELECT USING (true);
CREATE POLICY "Only admins can manage activity types" ON public.activity_types FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);

-- Políticas para employee_activities
CREATE POLICY "Users can view employee activities from their org" ON public.employee_activities 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create employee activities in their org" ON public.employee_activities 
FOR INSERT WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update employee activities in their org" ON public.employee_activities 
FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete employee activities in their org" ON public.employee_activities 
FOR DELETE USING (org_id = get_user_org_id());

-- Políticas para candidate_activities
CREATE POLICY "Users can view candidate activities from their org" ON public.candidate_activities 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create candidate activities in their org" ON public.candidate_activities 
FOR INSERT WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update candidate activities in their org" ON public.candidate_activities 
FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete candidate activities in their org" ON public.candidate_activities 
FOR DELETE USING (org_id = get_user_org_id());

-- Políticas para employee_evaluations
CREATE POLICY "Users can view employee evaluations from their org" ON public.employee_evaluations 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage employee evaluations in their org" ON public.employee_evaluations 
FOR ALL USING (org_id = get_user_org_id());

-- Políticas para employee_training
CREATE POLICY "Users can view employee training from their org" ON public.employee_training 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage employee training in their org" ON public.employee_training 
FOR ALL USING (org_id = get_user_org_id());

-- Políticas para employee_projects  
CREATE POLICY "Users can view employee projects from their org" ON public.employee_projects 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage employee projects in their org" ON public.employee_projects 
FOR ALL USING (org_id = get_user_org_id());

-- Políticas para employee_notes
CREATE POLICY "Users can view employee notes from their org" ON public.employee_notes 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create employee notes in their org" ON public.employee_notes 
FOR INSERT WITH CHECK (org_id = get_user_org_id() AND author_id = auth.uid());

CREATE POLICY "Users can update their own employee notes" ON public.employee_notes 
FOR UPDATE USING (org_id = get_user_org_id() AND author_id = auth.uid());

CREATE POLICY "Users can delete their own employee notes" ON public.employee_notes 
FOR DELETE USING (org_id = get_user_org_id() AND author_id = auth.uid());

-- Políticas para candidate_evaluations
CREATE POLICY "Users can view candidate evaluations from their org" ON public.candidate_evaluations 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage candidate evaluations in their org" ON public.candidate_evaluations 
FOR ALL USING (org_id = get_user_org_id());

-- Políticas para candidate_references
CREATE POLICY "Users can view candidate references from their org" ON public.candidate_references 
FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage candidate references in their org" ON public.candidate_references 
FOR ALL USING (org_id = get_user_org_id());

-- Insertar tipos de actividad por defecto
INSERT INTO public.activity_types (name, description, icon, color, category) VALUES
('Contratación', 'Proceso de contratación del empleado', 'user-plus', '#10b981', 'hr'),
('Evaluación', 'Evaluación de desempeño', 'star', '#f59e0b', 'evaluation'),
('Formación', 'Curso o formación completada', 'graduation-cap', '#3b82f6', 'training'),
('Promoción', 'Ascenso o cambio de posición', 'trending-up', '#8b5cf6', 'hr'),
('Proyecto', 'Participación en proyecto', 'briefcase', '#06b6d4', 'project'),
('Reunión', 'Reunión o entrevista', 'calendar', '#6366f1', 'general'),
('Nota', 'Nota o comentario', 'message-square', '#64748b', 'general'),
('Ausencia', 'Período de ausencia', 'clock', '#ef4444', 'hr'),
('Logro', 'Logro o reconocimiento', 'award', '#f59e0b', 'evaluation'),
('Solicitud CV', 'Solicitud de empleo recibida', 'file-text', '#10b981', 'general'),
('Entrevista Técnica', 'Entrevista técnica realizada', 'code', '#3b82f6', 'general'),
('Entrevista Cultural', 'Entrevista de ajuste cultural', 'users', '#8b5cf6', 'general'),
('Verificación Referencias', 'Verificación de referencias', 'check-circle', '#10b981', 'general'),
('Oferta Enviada', 'Oferta de trabajo enviada', 'send', '#f59e0b', 'general'),
('Oferta Aceptada', 'Oferta de trabajo aceptada', 'check', '#10b981', 'general'),
('Oferta Rechazada', 'Oferta de trabajo rechazada', 'x', '#ef4444', 'general');

-- Añadir triggers para updated_at
CREATE TRIGGER update_activity_types_updated_at BEFORE UPDATE ON public.activity_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_activities_updated_at BEFORE UPDATE ON public.employee_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidate_activities_updated_at BEFORE UPDATE ON public.candidate_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_evaluations_updated_at BEFORE UPDATE ON public.employee_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_training_updated_at BEFORE UPDATE ON public.employee_training FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_projects_updated_at BEFORE UPDATE ON public.employee_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_notes_updated_at BEFORE UPDATE ON public.employee_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidate_evaluations_updated_at BEFORE UPDATE ON public.candidate_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidate_references_updated_at BEFORE UPDATE ON public.candidate_references FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();