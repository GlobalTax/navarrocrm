-- Crear trigger para generar cuotas recurrentes automáticamente cuando una propuesta es aceptada
CREATE OR REPLACE FUNCTION public.auto_create_recurring_fee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Crear el trigger que se ejecuta después de actualizar propuestas
CREATE TRIGGER trigger_auto_create_recurring_fee
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_recurring_fee();