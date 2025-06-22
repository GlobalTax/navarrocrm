
-- Crear tabla principal de cuotas recurrentes
CREATE TABLE public.recurring_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  client_id UUID NOT NULL,
  proposal_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(10,2) NOT NULL,
  frequency VARCHAR(50) NOT NULL DEFAULT 'monthly', -- monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, paused, cancelled, completed
  billing_day INTEGER DEFAULT 1, -- día del mes para facturar
  included_hours INTEGER DEFAULT 0, -- horas incluidas en la cuota
  hourly_rate_extra NUMERIC(10,2) DEFAULT 0, -- tarifa por horas extras
  auto_invoice BOOLEAN DEFAULT true,
  auto_send_notifications BOOLEAN DEFAULT true,
  payment_terms INTEGER DEFAULT 30, -- días para pago
  priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
  tags TEXT[],
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL
);

-- Crear tabla para seguimiento de horas por cuota
CREATE TABLE public.recurring_fee_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_fee_id UUID NOT NULL REFERENCES public.recurring_fees(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  included_hours INTEGER NOT NULL DEFAULT 0,
  hours_used NUMERIC(4,2) DEFAULT 0,
  extra_hours NUMERIC(4,2) DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  extra_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(recurring_fee_id, billing_period_start)
);

-- Crear tabla para historial de facturación
CREATE TABLE public.recurring_fee_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_fee_id UUID NOT NULL REFERENCES public.recurring_fees(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  base_amount NUMERIC(10,2) NOT NULL,
  extra_hours_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, paid, overdue, cancelled
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para notificaciones automáticas
CREATE TABLE public.recurring_fee_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_fee_id UUID NOT NULL REFERENCES public.recurring_fees(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL, -- invoice_generated, payment_reminder, hours_exceeded, etc.
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_recurring_fees_org_id ON public.recurring_fees(org_id);
CREATE INDEX idx_recurring_fees_client_id ON public.recurring_fees(client_id);
CREATE INDEX idx_recurring_fees_next_billing ON public.recurring_fees(next_billing_date);
CREATE INDEX idx_recurring_fees_status ON public.recurring_fees(status);
CREATE INDEX idx_recurring_fee_hours_fee_id ON public.recurring_fee_hours(recurring_fee_id);
CREATE INDEX idx_recurring_fee_invoices_fee_id ON public.recurring_fee_invoices(recurring_fee_id);
CREATE INDEX idx_recurring_fee_invoices_status ON public.recurring_fee_invoices(status);

-- Función para calcular próxima fecha de facturación
CREATE OR REPLACE FUNCTION public.calculate_next_billing_date(
  input_date DATE,
  frequency VARCHAR(50),
  billing_day INTEGER DEFAULT 1
) RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_date DATE;
BEGIN
  CASE frequency
    WHEN 'monthly' THEN
      next_date := date_trunc('month', input_date) + INTERVAL '1 month' + (billing_day - 1) * INTERVAL '1 day';
    WHEN 'quarterly' THEN
      next_date := date_trunc('quarter', input_date) + INTERVAL '3 months' + (billing_day - 1) * INTERVAL '1 day';
    WHEN 'yearly' THEN
      next_date := date_trunc('year', input_date) + INTERVAL '1 year' + (billing_day - 1) * INTERVAL '1 day';
    ELSE
      next_date := input_date + INTERVAL '1 month';
  END CASE;
  
  RETURN next_date;
END;
$$;

-- Función para actualizar horas utilizadas automáticamente
CREATE OR REPLACE FUNCTION public.update_recurring_fee_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  fee_record RECORD;
  hours_in_period NUMERIC;
BEGIN
  -- Buscar cuotas recurrentes activas para este cliente
  FOR fee_record IN 
    SELECT rf.* FROM public.recurring_fees rf
    JOIN public.cases c ON c.client_id = rf.client_id
    WHERE c.id = NEW.case_id 
    AND rf.status = 'active'
    AND rf.included_hours > 0
  LOOP
    -- Calcular horas en el período actual
    SELECT COALESCE(SUM(te.duration_minutes / 60.0), 0) INTO hours_in_period
    FROM public.time_entries te
    WHERE te.case_id = NEW.case_id
    AND te.created_at >= fee_record.next_billing_date - INTERVAL '1 month'
    AND te.created_at < fee_record.next_billing_date;
    
    -- Actualizar o crear registro de horas para el período
    INSERT INTO public.recurring_fee_hours (
      recurring_fee_id,
      billing_period_start,
      billing_period_end,
      included_hours,
      hours_used,
      extra_hours,
      hourly_rate
    ) VALUES (
      fee_record.id,
      fee_record.next_billing_date - INTERVAL '1 month',
      fee_record.next_billing_date,
      fee_record.included_hours,
      hours_in_period,
      GREATEST(hours_in_period - fee_record.included_hours, 0),
      fee_record.hourly_rate_extra
    )
    ON CONFLICT (recurring_fee_id, billing_period_start) 
    DO UPDATE SET
      hours_used = hours_in_period,
      extra_hours = GREATEST(hours_in_period - fee_record.included_hours, 0),
      updated_at = now();
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger para actualizar horas cuando se registran entradas de tiempo
CREATE TRIGGER update_recurring_fee_hours_trigger
  AFTER INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_recurring_fee_hours();

-- Función para generar facturas automáticamente
CREATE OR REPLACE FUNCTION public.generate_recurring_invoices()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  fee_record RECORD;
  hours_record RECORD;
  invoice_count INTEGER := 0;
  base_amount NUMERIC;
  extra_amount NUMERIC;
  total_amount NUMERIC;
BEGIN
  -- Buscar cuotas que necesitan facturación
  FOR fee_record IN 
    SELECT * FROM public.recurring_fees
    WHERE status = 'active'
    AND next_billing_date <= CURRENT_DATE
    AND auto_invoice = true
  LOOP
    -- Obtener información de horas del período
    SELECT * INTO hours_record
    FROM public.recurring_fee_hours
    WHERE recurring_fee_id = fee_record.id
    AND billing_period_start = fee_record.next_billing_date - INTERVAL '1 month'
    LIMIT 1;
    
    -- Calcular montos
    base_amount := fee_record.amount;
    extra_amount := COALESCE(hours_record.extra_hours * fee_record.hourly_rate_extra, 0);
    total_amount := base_amount + extra_amount;
    
    -- Generar factura
    INSERT INTO public.recurring_fee_invoices (
      recurring_fee_id,
      invoice_date,
      due_date,
      billing_period_start,
      billing_period_end,
      base_amount,
      extra_hours_amount,
      total_amount,
      status
    ) VALUES (
      fee_record.id,
      CURRENT_DATE,
      CURRENT_DATE + fee_record.payment_terms,
      fee_record.next_billing_date - INTERVAL '1 month',
      fee_record.next_billing_date,
      base_amount,
      extra_amount,
      total_amount,
      'pending'
    );
    
    -- Actualizar próxima fecha de facturación
    UPDATE public.recurring_fees
    SET next_billing_date = public.calculate_next_billing_date(
      next_billing_date, 
      frequency, 
      billing_day
    ),
    updated_at = now()
    WHERE id = fee_record.id;
    
    invoice_count := invoice_count + 1;
  END LOOP;
  
  RETURN invoice_count;
END;
$$;

-- Políticas RLS
ALTER TABLE public.recurring_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_fee_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_fee_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para recurring_fees
CREATE POLICY "Users can view org recurring fees" ON public.recurring_fees
  FOR SELECT USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert org recurring fees" ON public.recurring_fees
  FOR INSERT WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update org recurring fees" ON public.recurring_fees
  FOR UPDATE USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete org recurring fees" ON public.recurring_fees
  FOR DELETE USING (org_id = public.get_user_org_id());

-- Políticas para recurring_fee_hours
CREATE POLICY "Users can view org recurring fee hours" ON public.recurring_fee_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can insert org recurring fee hours" ON public.recurring_fee_hours
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can update org recurring fee hours" ON public.recurring_fee_hours
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

-- Políticas para recurring_fee_invoices
CREATE POLICY "Users can view org recurring fee invoices" ON public.recurring_fee_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can insert org recurring fee invoices" ON public.recurring_fee_invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can update org recurring fee invoices" ON public.recurring_fee_invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

-- Políticas para recurring_fee_notifications
CREATE POLICY "Users can view org recurring fee notifications" ON public.recurring_fee_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

CREATE POLICY "Users can insert org recurring fee notifications" ON public.recurring_fee_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recurring_fees rf 
      WHERE rf.id = recurring_fee_id AND rf.org_id = public.get_user_org_id()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_recurring_fees_updated_at
  BEFORE UPDATE ON public.recurring_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_fee_hours_updated_at
  BEFORE UPDATE ON public.recurring_fee_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
