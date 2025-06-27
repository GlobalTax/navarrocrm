
-- Crear tabla de salas/espacios de oficina
CREATE TABLE public.office_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 1,
  room_type CHARACTER VARYING NOT NULL DEFAULT 'meeting_room',
  location CHARACTER VARYING,
  floor CHARACTER VARYING,
  equipment_available TEXT[],
  hourly_rate NUMERIC DEFAULT 0,
  is_bookable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  amenities JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de inventario de equipos
CREATE TABLE public.equipment_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  category CHARACTER VARYING NOT NULL DEFAULT 'general',
  serial_number CHARACTER VARYING,
  brand CHARACTER VARYING,
  model CHARACTER VARYING,
  purchase_date DATE,
  warranty_expiry DATE,
  purchase_cost NUMERIC,
  current_location CHARACTER VARYING,
  room_id UUID REFERENCES public.office_rooms(id),
  assigned_to UUID REFERENCES public.users(id),
  status CHARACTER VARYING NOT NULL DEFAULT 'available',
  condition CHARACTER VARYING NOT NULL DEFAULT 'good',
  maintenance_schedule CHARACTER VARYING,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  qr_code CHARACTER VARYING,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de reservas de salas
CREATE TABLE public.room_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.office_rooms(id) ON DELETE CASCADE,
  reserved_by UUID NOT NULL REFERENCES public.users(id),
  title CHARACTER VARYING NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  attendees_count INTEGER DEFAULT 1,
  attendees_emails TEXT[],
  setup_requirements TEXT,
  catering_requested BOOLEAN DEFAULT false,
  recurring_pattern CHARACTER VARYING,
  recurring_until DATE,
  status CHARACTER VARYING NOT NULL DEFAULT 'confirmed',
  cost NUMERIC DEFAULT 0,
  approved_by UUID REFERENCES public.users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de asignaciones de equipos
CREATE TABLE public.equipment_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment_inventory(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.users(id),
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  assignment_type CHARACTER VARYING NOT NULL DEFAULT 'temporary',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  purpose TEXT,
  location CHARACTER VARYING,
  status CHARACTER VARYING NOT NULL DEFAULT 'active',
  return_condition CHARACTER VARYING,
  return_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de mantenimiento de equipos
CREATE TABLE public.equipment_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment_inventory(id) ON DELETE CASCADE,
  maintenance_type CHARACTER VARYING NOT NULL DEFAULT 'preventive',
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  performed_by CHARACTER VARYING,
  cost NUMERIC DEFAULT 0,
  description TEXT,
  issues_found TEXT,
  actions_taken TEXT,
  status CHARACTER VARYING NOT NULL DEFAULT 'scheduled',
  priority CHARACTER VARYING NOT NULL DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_office_rooms_org_id ON public.office_rooms(org_id);
CREATE INDEX idx_equipment_inventory_org_id ON public.equipment_inventory(org_id);
CREATE INDEX idx_equipment_inventory_status ON public.equipment_inventory(status);
CREATE INDEX idx_room_reservations_org_id ON public.room_reservations(org_id);
CREATE INDEX idx_room_reservations_datetime ON public.room_reservations(start_datetime, end_datetime);
CREATE INDEX idx_equipment_assignments_org_id ON public.equipment_assignments(org_id);
CREATE INDEX idx_equipment_assignments_equipment_id ON public.equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_maintenance_org_id ON public.equipment_maintenance(org_id);
CREATE INDEX idx_equipment_maintenance_scheduled_date ON public.equipment_maintenance(scheduled_date);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.office_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para office_rooms
CREATE POLICY "Users can view org rooms" ON public.office_rooms
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create org rooms" ON public.office_rooms
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can update org rooms" ON public.office_rooms
  FOR UPDATE USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can delete org rooms" ON public.office_rooms
  FOR DELETE USING (org_id = public.get_current_user_org_id());

-- Crear políticas RLS para equipment_inventory
CREATE POLICY "Users can view org equipment" ON public.equipment_inventory
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create org equipment" ON public.equipment_inventory
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can update org equipment" ON public.equipment_inventory
  FOR UPDATE USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can delete org equipment" ON public.equipment_inventory
  FOR DELETE USING (org_id = public.get_current_user_org_id());

-- Crear políticas RLS para room_reservations
CREATE POLICY "Users can view org reservations" ON public.room_reservations
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create org reservations" ON public.room_reservations
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can update org reservations" ON public.room_reservations
  FOR UPDATE USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can delete org reservations" ON public.room_reservations
  FOR DELETE USING (org_id = public.get_current_user_org_id());

-- Crear políticas RLS para equipment_assignments
CREATE POLICY "Users can view org assignments" ON public.equipment_assignments
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create org assignments" ON public.equipment_assignments
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can update org assignments" ON public.equipment_assignments
  FOR UPDATE USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can delete org assignments" ON public.equipment_assignments
  FOR DELETE USING (org_id = public.get_current_user_org_id());

-- Crear políticas RLS para equipment_maintenance
CREATE POLICY "Users can view org maintenance" ON public.equipment_maintenance
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create org maintenance" ON public.equipment_maintenance
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can update org maintenance" ON public.equipment_maintenance
  FOR UPDATE USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can delete org maintenance" ON public.equipment_maintenance
  FOR DELETE USING (org_id = public.get_current_user_org_id());

-- Trigger para actualizar updated_at
CREATE TRIGGER update_office_rooms_updated_at
  BEFORE UPDATE ON public.office_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_inventory_updated_at
  BEFORE UPDATE ON public.equipment_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_reservations_updated_at
  BEFORE UPDATE ON public.room_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_assignments_updated_at
  BEFORE UPDATE ON public.equipment_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_maintenance_updated_at
  BEFORE UPDATE ON public.equipment_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para validar reservas de salas sin conflictos
CREATE OR REPLACE FUNCTION public.validate_room_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Validar que end_datetime sea posterior a start_datetime
  IF NEW.end_datetime <= NEW.start_datetime THEN
    RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
  END IF;
  
  -- Validar que no haya conflictos con otras reservas activas
  IF EXISTS (
    SELECT 1 FROM public.room_reservations 
    WHERE room_id = NEW.room_id 
    AND status IN ('confirmed', 'pending')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.start_datetime >= start_datetime AND NEW.start_datetime < end_datetime) OR
      (NEW.end_datetime > start_datetime AND NEW.end_datetime <= end_datetime) OR
      (NEW.start_datetime <= start_datetime AND NEW.end_datetime >= end_datetime)
    )
  ) THEN
    RAISE EXCEPTION 'La sala ya está reservada en ese horario';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger de validación
CREATE TRIGGER validate_room_reservation_trigger
  BEFORE INSERT OR UPDATE ON public.room_reservations
  FOR EACH ROW EXECUTE FUNCTION public.validate_room_reservation();

-- Función para obtener estadísticas de la oficina
CREATE OR REPLACE FUNCTION public.get_office_stats(org_uuid uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalRooms', (SELECT COUNT(*) FROM public.office_rooms WHERE org_id = org_uuid AND is_active = true),
    'totalEquipment', (SELECT COUNT(*) FROM public.equipment_inventory WHERE org_id = org_uuid),
    'availableEquipment', (SELECT COUNT(*) FROM public.equipment_inventory WHERE org_id = org_uuid AND status = 'available'),
    'activeReservations', (SELECT COUNT(*) FROM public.room_reservations WHERE org_id = org_uuid AND status = 'confirmed' AND end_datetime > now()),
    'todayReservations', (SELECT COUNT(*) FROM public.room_reservations WHERE org_id = org_uuid AND status = 'confirmed' AND DATE(start_datetime) = CURRENT_DATE),
    'pendingMaintenance', (SELECT COUNT(*) FROM public.equipment_maintenance WHERE org_id = org_uuid AND status = 'scheduled')
  ) INTO result;
  
  RETURN result;
END;
$$;
