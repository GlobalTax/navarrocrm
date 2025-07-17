-- Crear tabla para almacenar facturas sincronizadas desde Quantum
CREATE TABLE IF NOT EXISTS public.quantum_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quantum_invoice_id text NOT NULL UNIQUE,
  org_id uuid NOT NULL,
  contact_id uuid REFERENCES public.contacts(id),
  quantum_customer_id text,
  client_name text NOT NULL,
  series_and_number text NOT NULL,
  invoice_date date NOT NULL,
  total_amount_without_taxes numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  invoice_lines jsonb DEFAULT '[]'::jsonb,
  quantum_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_quantum_invoices_org_id ON public.quantum_invoices(org_id);
CREATE INDEX idx_quantum_invoices_contact_id ON public.quantum_invoices(contact_id);
CREATE INDEX idx_quantum_invoices_invoice_date ON public.quantum_invoices(invoice_date);
CREATE INDEX idx_quantum_invoices_quantum_customer_id ON public.quantum_invoices(quantum_customer_id);

-- Habilitar RLS
ALTER TABLE public.quantum_invoices ENABLE ROW LEVEL SECURITY;

-- Política de acceso: usuarios pueden ver facturas de su organización
CREATE POLICY "Users can view quantum invoices from their org" 
ON public.quantum_invoices 
FOR SELECT 
USING (org_id = get_user_org_id());

-- Política de inserción: solo el sistema puede insertar facturas
CREATE POLICY "System can insert quantum invoices" 
ON public.quantum_invoices 
FOR INSERT 
WITH CHECK (true);

-- Política de actualización: solo el sistema puede actualizar facturas
CREATE POLICY "System can update quantum invoices" 
ON public.quantum_invoices 
FOR UPDATE 
USING (true);

-- Crear tabla para historial de sincronización de facturas
CREATE TABLE IF NOT EXISTS public.quantum_invoice_sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  sync_status character varying NOT NULL CHECK (sync_status IN ('success', 'error', 'in_progress')),
  sync_type character varying NOT NULL DEFAULT 'manual',
  start_date date,
  end_date date,
  invoices_processed integer DEFAULT 0,
  invoices_created integer DEFAULT 0,
  invoices_updated integer DEFAULT 0,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para historial
CREATE INDEX idx_quantum_invoice_sync_history_org_id ON public.quantum_invoice_sync_history(org_id);
CREATE INDEX idx_quantum_invoice_sync_history_created_at ON public.quantum_invoice_sync_history(created_at DESC);

-- Habilitar RLS para historial
ALTER TABLE public.quantum_invoice_sync_history ENABLE ROW LEVEL SECURITY;

-- Política de acceso para historial
CREATE POLICY "Users can view invoice sync history from their org" 
ON public.quantum_invoice_sync_history 
FOR SELECT 
USING (org_id = get_user_org_id());

-- Política de inserción para historial
CREATE POLICY "System can insert invoice sync history" 
ON public.quantum_invoice_sync_history 
FOR INSERT 
WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_quantum_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quantum_invoices_updated_at
    BEFORE UPDATE ON public.quantum_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_quantum_invoices_updated_at();