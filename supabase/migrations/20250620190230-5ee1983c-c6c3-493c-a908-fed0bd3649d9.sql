
-- Crear tabla clients (clientes)
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Crear tabla cases (expedientes/casos)
CREATE TABLE public.cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id),
  client_id uuid NOT NULL REFERENCES public.clients(id),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Crear tabla tasks (tareas)
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.cases(id),
  assigned_to uuid REFERENCES public.users(id),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Crear tabla time_entries (registros de tiempo)
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  task_id uuid REFERENCES public.tasks(id),
  case_id uuid REFERENCES public.cases(id),
  duration_minutes integer NOT NULL,
  description text,
  is_billable boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para clients
CREATE POLICY "Users can view clients from their org" 
  ON public.clients 
  FOR SELECT 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert clients in their org" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update clients in their org" 
  ON public.clients 
  FOR UPDATE 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Crear políticas RLS para cases
CREATE POLICY "Users can view cases from their org" 
  ON public.cases 
  FOR SELECT 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert cases in their org" 
  ON public.cases 
  FOR INSERT 
  WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update cases in their org" 
  ON public.cases 
  FOR UPDATE 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Crear políticas RLS para tasks
CREATE POLICY "Users can view tasks from their org" 
  ON public.tasks 
  FOR SELECT 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert tasks in their org" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update tasks in their org" 
  ON public.tasks 
  FOR UPDATE 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Crear políticas RLS para time_entries
CREATE POLICY "Users can view time entries from their org" 
  ON public.time_entries 
  FOR SELECT 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert time entries in their org" 
  ON public.time_entries 
  FOR INSERT 
  WITH CHECK (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update time entries in their org" 
  ON public.time_entries 
  FOR UPDATE 
  USING (org_id IN (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON public.clients 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at 
  BEFORE UPDATE ON public.cases 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at 
  BEFORE UPDATE ON public.time_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejor rendimiento
CREATE INDEX idx_clients_org_id ON public.clients(org_id);
CREATE INDEX idx_cases_org_id ON public.cases(org_id);
CREATE INDEX idx_cases_client_id ON public.cases(client_id);
CREATE INDEX idx_tasks_org_id ON public.tasks(org_id);
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX idx_time_entries_org_id ON public.time_entries(org_id);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_created_at ON public.time_entries(created_at);
