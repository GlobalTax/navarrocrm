
-- Crear tabla calendar_events para el sistema de calendario
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title character varying NOT NULL,
  description text,
  start_datetime timestamp with time zone NOT NULL,
  end_datetime timestamp with time zone NOT NULL,
  event_type character varying NOT NULL DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'deadline', 'task', 'court', 'consultation')),
  location text,
  is_all_day boolean NOT NULL DEFAULT false,
  reminder_minutes integer,
  status character varying NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crear función de validación para fechas
CREATE OR REPLACE FUNCTION public.validate_calendar_event_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar que end_datetime sea posterior a start_datetime
  IF NEW.end_datetime <= NEW.start_datetime THEN
    RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
  END IF;
  
  -- Si es evento de todo el día, asegurar que las horas sean coherentes
  IF NEW.is_all_day = true THEN
    NEW.start_datetime := date_trunc('day', NEW.start_datetime);
    NEW.end_datetime := date_trunc('day', NEW.end_datetime) + INTERVAL '23 hours 59 minutes';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger de validación
CREATE TRIGGER validate_calendar_event_dates_trigger
  BEFORE INSERT OR UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_calendar_event_dates();

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean eventos de su organización
CREATE POLICY "Users can view events in their organization"
  ON public.calendar_events
  FOR SELECT
  USING (org_id = public.get_user_org_id());

-- Política para que los usuarios puedan crear eventos en su organización
CREATE POLICY "Users can create events in their organization"
  ON public.calendar_events
  FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id() AND created_by = auth.uid());

-- Política para que los usuarios puedan actualizar sus propios eventos
CREATE POLICY "Users can update their own events"
  ON public.calendar_events
  FOR UPDATE
  USING (org_id = public.get_user_org_id() AND created_by = auth.uid());

-- Política para que los usuarios puedan eliminar sus propios eventos
CREATE POLICY "Users can delete their own events"
  ON public.calendar_events
  FOR DELETE
  USING (org_id = public.get_user_org_id() AND created_by = auth.uid());

-- Política adicional para que Partners y Area Managers puedan ver/editar todos los eventos de la organización
CREATE POLICY "Partners and managers can manage all org events"
  ON public.calendar_events
  FOR ALL
  USING (
    org_id = public.get_user_org_id() 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'area_manager')
    )
  );

-- Crear índices para optimización
CREATE INDEX idx_calendar_events_start_datetime ON public.calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_org_id ON public.calendar_events(org_id);
CREATE INDEX idx_calendar_events_org_start ON public.calendar_events(org_id, start_datetime);
CREATE INDEX idx_calendar_events_client_id ON public.calendar_events(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_calendar_events_case_id ON public.calendar_events(case_id) WHERE case_id IS NOT NULL;
CREATE INDEX idx_calendar_events_created_by ON public.calendar_events(created_by);
