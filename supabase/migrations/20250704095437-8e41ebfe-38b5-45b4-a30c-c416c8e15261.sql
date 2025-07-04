-- Crear tablas para sistema de versionado y colaboración de documentos

-- Tabla para versiones de documentos generados
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  variables_data JSONB NOT NULL DEFAULT '{}',
  changes_summary TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID NOT NULL
);

-- Tabla para metadatos extendidos de documentos
CREATE TABLE public.document_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  locked_by UUID,
  locked_at TIMESTAMP WITH TIME ZONE,
  org_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para comentarios en documentos
CREATE TABLE public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  version_id UUID,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  position_data JSONB, -- Para comentarios contextuales (línea, párrafo, etc.)
  status VARCHAR DEFAULT 'active', -- active, resolved, archived
  is_internal BOOLEAN DEFAULT false, -- Si es un comentario interno o para el cliente
  parent_comment_id UUID, -- Para respuestas a comentarios
  mentioned_users UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID NOT NULL
);

-- Tabla para compartir documentos
CREATE TABLE public.document_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  shared_with UUID, -- Usuario específico
  shared_with_role VARCHAR, -- O rol específico (partner, senior, etc.)
  permissions JSONB NOT NULL DEFAULT '{"read": true, "comment": false, "edit": false}',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  share_token VARCHAR UNIQUE, -- Para compartir con enlaces
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID NOT NULL
);

-- Tabla para log de actividades en documentos
CREATE TABLE public.document_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action_type VARCHAR NOT NULL, -- created, edited, commented, shared, version_created, status_changed
  details JSONB DEFAULT '{}',
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID NOT NULL
);

-- Agregar columnas a generated_documents para versionado
ALTER TABLE public.generated_documents 
ADD COLUMN version_number INTEGER DEFAULT 1,
ADD COLUMN parent_document_id UUID,
ADD COLUMN is_current_version BOOLEAN DEFAULT true,
ADD COLUMN approval_status VARCHAR DEFAULT 'draft', -- draft, pending_review, approved, rejected
ADD COLUMN approved_by UUID,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN revision_notes TEXT;

-- Índices para performance
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_version_number ON public.document_versions(document_id, version_number);
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);
CREATE INDEX idx_document_comments_user_id ON public.document_comments(user_id);
CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_activities_document_id ON public.document_activities(document_id);
CREATE INDEX idx_generated_documents_parent ON public.generated_documents(parent_document_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para document_versions
CREATE POLICY "Users can view document versions from their org" 
ON public.document_versions FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create document versions in their org" 
ON public.document_versions FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

-- Políticas RLS para document_metadata
CREATE POLICY "Users can manage document metadata from their org" 
ON public.document_metadata FOR ALL 
USING (org_id = get_user_org_id());

-- Políticas RLS para document_comments
CREATE POLICY "Users can view document comments from their org" 
ON public.document_comments FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create document comments in their org" 
ON public.document_comments FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own comments" 
ON public.document_comments FOR UPDATE 
USING (org_id = get_user_org_id() AND user_id = auth.uid());

-- Políticas RLS para document_shares
CREATE POLICY "Users can view document shares from their org" 
ON public.document_shares FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create document shares in their org" 
ON public.document_shares FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND shared_by = auth.uid());

CREATE POLICY "Users can update their own shares" 
ON public.document_shares FOR UPDATE 
USING (org_id = get_user_org_id() AND shared_by = auth.uid());

-- Políticas RLS para document_activities
CREATE POLICY "Users can view document activities from their org" 
ON public.document_activities FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "System can insert document activities" 
ON public.document_activities FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

-- Función para crear nueva versión automáticamente
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear versión si el contenido cambió
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.variables_data IS DISTINCT FROM NEW.variables_data THEN
    -- Actualizar número de versión
    NEW.version_number := COALESCE(OLD.version_number, 0) + 1;
    
    -- Insertar nueva versión en el historial
    INSERT INTO public.document_versions (
      document_id, version_number, content, variables_data, 
      created_by, org_id, changes_summary
    ) VALUES (
      NEW.id, NEW.version_number, NEW.content, NEW.variables_data,
      auth.uid(), NEW.org_id, 'Versión actualizada automáticamente'
    );
    
    -- Registrar actividad
    INSERT INTO public.document_activities (
      document_id, user_id, action_type, details, org_id
    ) VALUES (
      NEW.id, auth.uid(), 'version_created', 
      jsonb_build_object('version_number', NEW.version_number), NEW.org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para versionado automático
CREATE TRIGGER trigger_document_version
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_version();

-- Función para actualizar metadatos de acceso
CREATE OR REPLACE FUNCTION public.update_document_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.document_metadata (document_id, org_id, last_accessed_at, access_count)
  VALUES (NEW.id, NEW.org_id, now(), 1)
  ON CONFLICT (document_id) 
  DO UPDATE SET 
    last_accessed_at = now(),
    access_count = document_metadata.access_count + 1;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para tracking de acceso
CREATE TRIGGER trigger_document_access
  AFTER SELECT ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_document_access();