
-- Crear tabla de departamentos
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1', -- Color hex para UI
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- Crear tabla de equipos
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10b981', -- Color hex para UI
  team_lead_id UUID, -- Referencias a users, pero sin FK por ahora
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- Crear tabla de membresías de equipos
CREATE TABLE public.team_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- member, lead, coordinator
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, user_id)
);

-- Agregar department_id a la tabla users
ALTER TABLE public.users ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para departments
CREATE POLICY "Users can view departments in their org" ON public.departments
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create departments in their org" ON public.departments
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update departments in their org" ON public.departments
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete departments in their org" ON public.departments
  FOR DELETE USING (org_id = get_user_org_id());

-- Políticas RLS para teams
CREATE POLICY "Users can view teams in their org" ON public.teams
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create teams in their org" ON public.teams
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update teams in their org" ON public.teams
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete teams in their org" ON public.teams
  FOR DELETE USING (org_id = get_user_org_id());

-- Políticas RLS para team_memberships
CREATE POLICY "Users can view team memberships in their org" ON public.team_memberships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can create team memberships in their org" ON public.team_memberships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can update team memberships in their org" ON public.team_memberships
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can delete team memberships in their org" ON public.team_memberships
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND org_id = get_user_org_id())
  );

-- Crear índices para rendimiento
CREATE INDEX idx_departments_org_id ON public.departments(org_id);
CREATE INDEX idx_teams_org_id ON public.teams(org_id);
CREATE INDEX idx_teams_department_id ON public.teams(department_id);
CREATE INDEX idx_team_memberships_team_id ON public.team_memberships(team_id);
CREATE INDEX idx_team_memberships_user_id ON public.team_memberships(user_id);
CREATE INDEX idx_users_department_id ON public.users(department_id);

-- Triggers para updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear tabla para asignaciones masivas de tareas (log de operaciones)
CREATE TABLE public.task_bulk_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assignment_type VARCHAR(50) NOT NULL, -- 'user', 'team', 'department'
  target_ids UUID[] NOT NULL, -- IDs de usuarios, equipos o departamentos
  task_ids UUID[] NOT NULL, -- IDs de las tareas asignadas
  assignment_data JSONB DEFAULT '{}', -- Datos adicionales de la asignación
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para task_bulk_assignments
ALTER TABLE public.task_bulk_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bulk assignments in their org" ON public.task_bulk_assignments
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create bulk assignments in their org" ON public.task_bulk_assignments
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

-- Índice para task_bulk_assignments
CREATE INDEX idx_task_bulk_assignments_org_id ON public.task_bulk_assignments(org_id);
