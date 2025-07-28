-- SECURITY FIX: Continue fixing remaining database functions (Part 2)

-- Fix generate_matter_number function
CREATE OR REPLACE FUNCTION public.generate_matter_number(org_uuid uuid)
 RETURNS character varying
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Fix handle_invitation_acceptance function
CREATE OR REPLACE FUNCTION public.handle_invitation_acceptance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Solo procesar cuando el status cambia a 'accepted'
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    -- Crear usuario en la tabla users (si no existe)
    INSERT INTO public.users (id, email, role, org_id, is_active)
    VALUES (
      auth.uid(), 
      NEW.email, 
      NEW.role, 
      NEW.org_id, 
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      role = NEW.role,
      org_id = NEW.org_id,
      is_active = true,
      updated_at = now();
    
    -- Registrar en auditoría
    INSERT INTO public.user_audit_log (
      org_id, target_user_id, action_by, action_type,
      new_value, details
    ) VALUES (
      NEW.org_id, auth.uid(), NEW.invited_by, 'invitation_accepted',
      jsonb_build_object('email', NEW.email, 'role', NEW.role),
      'Usuario creado tras aceptar invitación'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix validate_room_reservation function
CREATE OR REPLACE FUNCTION public.validate_room_reservation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Fix get_office_stats function
CREATE OR REPLACE FUNCTION public.get_office_stats(org_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Fix process_scheduled_reports function
CREATE OR REPLACE FUNCTION public.process_scheduled_reports()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  report_record RECORD;
BEGIN
  -- Buscar reportes que necesitan ser enviados
  FOR report_record IN 
    SELECT id, org_id, user_id, report_name, next_send_date, frequency
    FROM public.scheduled_reports 
    WHERE is_enabled = true 
    AND next_send_date <= now()
  LOOP
    -- Llamar a la función edge para enviar el reporte
    PERFORM net.http_post(
      url := 'https://jzbbbwfnzpwxmuhpbdya.supabase.co/functions/v1/send-scheduled-report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YmJid2ZuenB3eG11aHBiZHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDMxODgsImV4cCI6MjA2NjAxOTE4OH0.NMClKY9QPN77oFVhIv4i0EzGaKvFxX6wJj06l2dTr-8"}'::jsonb,
      body := json_build_object('reportId', report_record.id)::jsonb
    );
  END LOOP;
END;
$function$;

-- Fix auto_create_recurring_fee function
CREATE OR REPLACE FUNCTION public.auto_create_recurring_fee()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Solo procesar cuando el status cambia a 'won' y es una propuesta recurrente
  IF OLD.status != 'won' AND NEW.status = 'won' AND NEW.is_recurring = true THEN
    -- Verificar si ya existe una cuota recurrente para esta propuesta
    IF NOT EXISTS (
      SELECT 1 FROM public.recurring_fees 
      WHERE proposal_id = NEW.id
    ) THEN
      -- Crear cuota recurrente automáticamente
      INSERT INTO public.recurring_fees (
        org_id,
        contact_id,
        proposal_id,
        name,
        description,
        amount,
        frequency,
        start_date,
        end_date,
        next_billing_date,
        billing_day,
        included_hours,
        hourly_rate_extra,
        auto_invoice,
        auto_send_notifications,
        payment_terms,
        priority,
        status,
        created_by
      ) VALUES (
        NEW.org_id,
        NEW.contact_id,
        NEW.id,
        'Cuota recurrente - ' || NEW.title,
        COALESCE(NEW.description, ''),
        COALESCE(NEW.retainer_amount, NEW.total_amount),
        COALESCE(NEW.recurring_frequency, 'monthly'),
        COALESCE(NEW.contract_start_date, CURRENT_DATE),
        NEW.contract_end_date,
        COALESCE(NEW.next_billing_date, NEW.contract_start_date, CURRENT_DATE),
        COALESCE(NEW.billing_day, 1),
        COALESCE(NEW.included_hours, 0),
        COALESCE(NEW.hourly_rate_extra, 0),
        true,
        true,
        30,
        'medium',
        'active',
        auth.uid()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;