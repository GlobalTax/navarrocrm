
-- Crear tabla para eventos de analytics
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT NOT NULL,
  page_title TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para métricas de performance
CREATE TABLE public.analytics_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  load_time NUMERIC,
  dom_content_loaded NUMERIC,
  first_contentful_paint NUMERIC,
  largest_contentful_paint NUMERIC,
  first_input_delay NUMERIC,
  cumulative_layout_shift NUMERIC,
  time_to_interactive NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para errores
CREATE TABLE public.analytics_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type TEXT NOT NULL DEFAULT 'error',
  page_url TEXT NOT NULL,
  user_agent TEXT,
  context_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para sesiones de usuario
CREATE TABLE public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para interacciones de usuario
CREATE TABLE public.analytics_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users,
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  element_path TEXT,
  page_url TEXT NOT NULL,
  interaction_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para analytics_events
CREATE POLICY "Users can view analytics_events from their org" 
  ON public.analytics_events 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert analytics_events to their org" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Políticas RLS para analytics_performance
CREATE POLICY "Users can view analytics_performance from their org" 
  ON public.analytics_performance 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert analytics_performance to their org" 
  ON public.analytics_performance 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Políticas RLS para analytics_errors
CREATE POLICY "Users can view analytics_errors from their org" 
  ON public.analytics_errors 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert analytics_errors to their org" 
  ON public.analytics_errors 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Políticas RLS para analytics_sessions
CREATE POLICY "Users can view analytics_sessions from their org" 
  ON public.analytics_sessions 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert analytics_sessions to their org" 
  ON public.analytics_sessions 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update analytics_sessions from their org" 
  ON public.analytics_sessions 
  FOR UPDATE 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Políticas RLS para analytics_interactions
CREATE POLICY "Users can view analytics_interactions from their org" 
  ON public.analytics_interactions 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert analytics_interactions to their org" 
  ON public.analytics_interactions 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Crear índices para optimizar consultas
CREATE INDEX idx_analytics_events_org_timestamp ON public.analytics_events(org_id, timestamp DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_performance_org_timestamp ON public.analytics_performance(org_id, timestamp DESC);
CREATE INDEX idx_analytics_errors_org_timestamp ON public.analytics_errors(org_id, timestamp DESC);
CREATE INDEX idx_analytics_sessions_org_start ON public.analytics_sessions(org_id, start_time DESC);
CREATE INDEX idx_analytics_interactions_org_timestamp ON public.analytics_interactions(org_id, timestamp DESC);

-- Trigger para actualizar updated_at en analytics_sessions
CREATE OR REPLACE FUNCTION update_analytics_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analytics_sessions_updated_at
    BEFORE UPDATE ON public.analytics_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_sessions_updated_at();
