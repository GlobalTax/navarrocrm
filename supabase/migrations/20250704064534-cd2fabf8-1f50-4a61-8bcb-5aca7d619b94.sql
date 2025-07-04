-- Crear tabla para plantillas de documentos
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type VARCHAR(50) NOT NULL, -- 'contract', 'communication', 'procedural'
  category VARCHAR(100), -- subcategoría específica
  practice_area VARCHAR(100),
  template_content TEXT NOT NULL, -- contenido con variables {{variable}}
  variables JSONB DEFAULT '[]', -- campos dinámicos [{name, type, required, default}]
  is_active BOOLEAN DEFAULT true,
  is_ai_enhanced BOOLEAN DEFAULT false, -- si usa IA para mejoras
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para documentos generados
CREATE TABLE public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.document_templates(id),
  case_id UUID REFERENCES public.cases(id),
  contact_id UUID REFERENCES public.contacts(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- contenido final con variables reemplazadas
  variables_data JSONB DEFAULT '{}', -- valores usados para variables
  file_path TEXT, -- ruta del PDF generado
  status VARCHAR(50) DEFAULT 'draft', -- draft, finalized, sent
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plantillas
CREATE POLICY "Users can view templates from their org" ON public.document_templates
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create templates in their org" ON public.document_templates
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update templates in their org" ON public.document_templates
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete templates in their org" ON public.document_templates
  FOR DELETE USING (org_id = get_user_org_id());

-- Políticas RLS para documentos generados
CREATE POLICY "Users can view generated docs from their org" ON public.generated_documents
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create generated docs in their org" ON public.generated_documents
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND generated_by = auth.uid());

CREATE POLICY "Users can update generated docs in their org" ON public.generated_documents
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete generated docs in their org" ON public.generated_documents
  FOR DELETE USING (org_id = get_user_org_id());

-- Índices para mejorar rendimiento
CREATE INDEX idx_document_templates_org_type ON public.document_templates(org_id, document_type);
CREATE INDEX idx_document_templates_active ON public.document_templates(org_id, is_active);
CREATE INDEX idx_generated_documents_org_status ON public.generated_documents(org_id, status);
CREATE INDEX idx_generated_documents_case ON public.generated_documents(case_id);

-- Trigger para updated_at
CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunas plantillas de ejemplo
INSERT INTO public.document_templates (org_id, name, description, document_type, category, practice_area, template_content, variables, created_by) 
SELECT 
  (SELECT id FROM public.organizations LIMIT 1),
  'Contrato de Servicios Legales',
  'Plantilla estándar para contratos de servicios jurídicos',
  'contract',
  'servicios',
  'general',
  'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES

Entre {{nombre_cliente}}, con DNI/NIF {{dni_cliente}}, domiciliado en {{direccion_cliente}} (en adelante, "EL CLIENTE"), y {{nombre_despacho}}, con domicilio en {{direccion_despacho}} (en adelante, "EL DESPACHO"), se acuerda:

OBJETO: El presente contrato tiene por objeto la prestación de servicios profesionales de asesoramiento jurídico en materia de {{materia_legal}}.

HONORARIOS: Los honorarios ascienden a {{importe_honorarios}} euros, pagaderos {{forma_pago}}.

DURACIÓN: El presente contrato tendrá una duración de {{duracion_contrato}}.

En {{ciudad}}, a {{fecha_contrato}}.

Firmado: {{nombre_cliente}}          Firmado: {{nombre_abogado}}',
  '[
    {"name": "nombre_cliente", "type": "text", "required": true, "label": "Nombre del Cliente"},
    {"name": "dni_cliente", "type": "text", "required": true, "label": "DNI/NIF del Cliente"},
    {"name": "direccion_cliente", "type": "text", "required": true, "label": "Dirección del Cliente"},
    {"name": "nombre_despacho", "type": "text", "required": true, "label": "Nombre del Despacho"},
    {"name": "direccion_despacho", "type": "text", "required": true, "label": "Dirección del Despacho"},
    {"name": "materia_legal", "type": "text", "required": true, "label": "Materia Legal"},
    {"name": "importe_honorarios", "type": "number", "required": true, "label": "Importe Honorarios"},
    {"name": "forma_pago", "type": "text", "required": true, "label": "Forma de Pago"},
    {"name": "duracion_contrato", "type": "text", "required": true, "label": "Duración del Contrato"},
    {"name": "ciudad", "type": "text", "required": true, "label": "Ciudad"},
    {"name": "fecha_contrato", "type": "date", "required": true, "label": "Fecha del Contrato"},
    {"name": "nombre_abogado", "type": "text", "required": true, "label": "Nombre del Abogado"}
  ]',
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM public.organizations LIMIT 1) AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.document_templates (org_id, name, description, document_type, category, practice_area, template_content, variables, created_by)
SELECT 
  (SELECT id FROM public.organizations LIMIT 1),
  'Carta de Requerimiento de Pago',
  'Plantilla para requerimientos de pago a deudores',
  'communication',
  'requerimiento',
  'civil',
  '{{lugar}}, {{fecha}}

Estimado/a Sr./Sra. {{nombre_destinatario}},

Por medio de la presente, le comunicamos que hasta la fecha no hemos recibido el pago de la cantidad de {{importe_deuda}} euros correspondiente a {{concepto_deuda}}, con vencimiento el {{fecha_vencimiento}}.

Le requerimos para que en el plazo de {{plazo_pago}} días, a contar desde la recepción de esta comunicación, proceda al abono de la citada cantidad, más los intereses de demora devengados.

En caso contrario, nos veremos obligados a iniciar las acciones legales oportunas para el cobro de la deuda.

Sin otro particular, quedamos a su disposición.

Atentamente,

{{nombre_remitente}}
{{cargo_remitente}}
{{nombre_despacho}}',
  '[
    {"name": "lugar", "type": "text", "required": true, "label": "Lugar"},
    {"name": "fecha", "type": "date", "required": true, "label": "Fecha"},
    {"name": "nombre_destinatario", "type": "text", "required": true, "label": "Nombre del Destinatario"},
    {"name": "importe_deuda", "type": "number", "required": true, "label": "Importe de la Deuda"},
    {"name": "concepto_deuda", "type": "text", "required": true, "label": "Concepto de la Deuda"},
    {"name": "fecha_vencimiento", "type": "date", "required": true, "label": "Fecha de Vencimiento"},
    {"name": "plazo_pago", "type": "number", "required": true, "label": "Plazo de Pago (días)"},
    {"name": "nombre_remitente", "type": "text", "required": true, "label": "Nombre del Remitente"},
    {"name": "cargo_remitente", "type": "text", "required": true, "label": "Cargo del Remitente"},
    {"name": "nombre_despacho", "type": "text", "required": true, "label": "Nombre del Despacho"}
  ]',
  (SELECT id FROM auth.users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM public.organizations LIMIT 1) AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

COMMENT ON TABLE public.document_templates IS 'Plantillas para generación de documentos legales';
COMMENT ON TABLE public.generated_documents IS 'Documentos generados a partir de plantillas';