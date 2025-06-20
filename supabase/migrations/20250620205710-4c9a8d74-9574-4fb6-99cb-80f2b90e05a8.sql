
-- Ampliar la tabla clients con nuevos campos para la ficha 360º
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS dni_nif VARCHAR(20);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address_postal_code VARCHAR(10);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address_country VARCHAR(100) DEFAULT 'España';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS legal_representative VARCHAR(255);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_type VARCHAR(50) DEFAULT 'particular' CHECK (client_type IN ('particular', 'empresa', 'autonomo'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS business_sector VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS how_found_us VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS contact_preference VARCHAR(50) DEFAULT 'email' CHECK (contact_preference IN ('email', 'telefono', 'whatsapp', 'presencial'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'es' CHECK (preferred_language IN ('es', 'ca', 'en'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'transferencia' CHECK (payment_method IN ('transferencia', 'domiciliacion', 'efectivo', 'tarjeta'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'prospecto', 'bloqueado'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Crear tabla para notas e interacciones del cliente
CREATE TABLE IF NOT EXISTS public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'llamada', 'reunion', 'email', 'tarea', 'recordatorio')),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para documentos del cliente
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  document_type VARCHAR(100) DEFAULT 'general' CHECK (document_type IN ('general', 'contrato', 'identificacion', 'poder', 'factura', 'comunicacion')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_org_id ON public.client_notes(org_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON public.client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_org_id ON public.client_documents(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON public.clients(client_type);

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
