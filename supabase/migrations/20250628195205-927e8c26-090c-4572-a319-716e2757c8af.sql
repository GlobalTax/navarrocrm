
-- Crear tabla de categorías de la academia
CREATE TABLE public.academy_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(50) NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de cursos de la academia
CREATE TABLE public.academy_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.academy_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50) NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- en minutos
  total_lessons INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de lecciones de la academia
CREATE TABLE public.academy_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  lesson_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (lesson_type IN ('text', 'interactive', 'quiz')),
  estimated_duration INTEGER, -- en minutos
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  prerequisites TEXT[] DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  practical_exercises JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de progreso del usuario en la academia
CREATE TABLE public.academy_user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent INTEGER NOT NULL DEFAULT 0, -- en minutos
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- Agregar índices para mejorar rendimiento
CREATE INDEX idx_academy_categories_org_id ON public.academy_categories(org_id);
CREATE INDEX idx_academy_categories_active ON public.academy_categories(org_id, is_active);

CREATE INDEX idx_academy_courses_org_id ON public.academy_courses(org_id);
CREATE INDEX idx_academy_courses_category ON public.academy_courses(category_id);
CREATE INDEX idx_academy_courses_published ON public.academy_courses(org_id, is_published);

CREATE INDEX idx_academy_lessons_org_id ON public.academy_lessons(org_id);
CREATE INDEX idx_academy_lessons_course ON public.academy_lessons(course_id);
CREATE INDEX idx_academy_lessons_published ON public.academy_lessons(course_id, is_published);

CREATE INDEX idx_academy_progress_user ON public.academy_user_progress(user_id);
CREATE INDEX idx_academy_progress_course ON public.academy_user_progress(course_id);
CREATE INDEX idx_academy_progress_user_course ON public.academy_user_progress(user_id, course_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_user_progress ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para academy_categories
CREATE POLICY "Users can view academy categories from their org" 
ON public.academy_categories FOR SELECT 
USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can manage academy categories from their org" 
ON public.academy_categories FOR ALL 
USING (org_id = public.get_user_org_id());

-- Crear políticas RLS para academy_courses
CREATE POLICY "Users can view academy courses from their org" 
ON public.academy_courses FOR SELECT 
USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can manage academy courses from their org" 
ON public.academy_courses FOR ALL 
USING (org_id = public.get_user_org_id());

-- Crear políticas RLS para academy_lessons
CREATE POLICY "Users can view academy lessons from their org" 
ON public.academy_lessons FOR SELECT 
USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can manage academy lessons from their org" 
ON public.academy_lessons FOR ALL 
USING (org_id = public.get_user_org_id());

-- Crear políticas RLS para academy_user_progress
CREATE POLICY "Users can view their own progress" 
ON public.academy_user_progress FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own progress" 
ON public.academy_user_progress FOR ALL 
USING (user_id = auth.uid());

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_academy_categories_updated_at 
BEFORE UPDATE ON public.academy_categories 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_courses_updated_at 
BEFORE UPDATE ON public.academy_courses 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_lessons_updated_at 
BEFORE UPDATE ON public.academy_lessons 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_user_progress_updated_at 
BEFORE UPDATE ON public.academy_user_progress 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar datos de ejemplo para las categorías
INSERT INTO public.academy_categories (org_id, name, description, icon, color, sort_order) 
SELECT 
  id as org_id,
  'Gestión Básica' as name,
  'Fundamentos del CRM y gestión de clientes' as description,
  'Users' as icon,
  '#3B82F6' as color,
  1 as sort_order
FROM public.organizations 
LIMIT 1;

INSERT INTO public.academy_categories (org_id, name, description, icon, color, sort_order) 
SELECT 
  id as org_id,
  'Funcionalidades Comerciales' as name,
  'Propuestas, ventas y facturación' as description,
  'FileText' as icon,
  '#10B981' as color,
  2 as sort_order
FROM public.organizations 
LIMIT 1;

INSERT INTO public.academy_categories (org_id, name, description, icon, color, sort_order) 
SELECT 
  id as org_id,
  'Automatización y IA' as name,
  'Workflows y herramientas de inteligencia artificial' as description,
  'Brain' as icon,
  '#8B5CF6' as color,
  3 as sort_order
FROM public.organizations 
LIMIT 1;

INSERT INTO public.academy_categories (org_id, name, description, icon, color, sort_order) 
SELECT 
  id as org_id,
  'Administración' as name,
  'Configuración y gestión del sistema' as description,
  'Settings' as icon,
  '#6B7280' as color,
  4 as sort_order
FROM public.organizations 
LIMIT 1;
