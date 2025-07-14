-- Crear tabla para almacenar cuentas sincronizadas desde Quantum
CREATE TABLE public.cuentas (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  balance_actual numeric DEFAULT 0,
  debito numeric DEFAULT 0,
  credito numeric DEFAULT 0,
  datos_completos jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_cuentas_nombre ON public.cuentas (nombre);
CREATE INDEX idx_cuentas_balance ON public.cuentas (balance_actual);
CREATE INDEX idx_cuentas_updated_at ON public.cuentas (updated_at);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_cuentas_updated_at
  BEFORE UPDATE ON public.cuentas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies para la tabla cuentas
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden ver las cuentas
CREATE POLICY "Authenticated users can view cuentas"
  ON public.cuentas
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo el sistema puede insertar/actualizar cuentas (desde las funciones de sincronización)
CREATE POLICY "System can manage cuentas"
  ON public.cuentas
  FOR ALL
  TO service_role
  USING (true);

-- Tabla para registrar el historial de sincronizaciones
CREATE TABLE public.quantum_sync_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date timestamp with time zone DEFAULT now(),
  status text NOT NULL, -- 'success', 'error'
  message text,
  records_processed integer DEFAULT 0,
  error_details jsonb
);

-- RLS para el historial de sincronizaciones
ALTER TABLE public.quantum_sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sync history"
  ON public.quantum_sync_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage sync history"
  ON public.quantum_sync_history
  FOR ALL
  TO service_role
  USING (true);