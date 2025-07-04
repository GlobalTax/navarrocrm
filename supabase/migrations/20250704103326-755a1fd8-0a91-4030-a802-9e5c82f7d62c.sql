-- Crear tabla para análisis de documentos con IA
CREATE TABLE public.document_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL,
  analysis_type VARCHAR NOT NULL, -- content_quality, consistency_check, legal_review, sentiment_analysis
  findings JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  analysis_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID NOT NULL
);

-- Índices para performance
CREATE INDEX idx_document_analysis_document_id ON public.document_analysis(document_id);
CREATE INDEX idx_document_analysis_org_id ON public.document_analysis(org_id);
CREATE INDEX idx_document_analysis_type ON public.document_analysis(analysis_type);

-- Habilitar RLS
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view document analysis from their org" 
ON public.document_analysis FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "System can insert document analysis" 
ON public.document_analysis FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update document analysis from their org" 
ON public.document_analysis FOR UPDATE 
USING (org_id = get_user_org_id());

-- Crear tabla para métricas de IA de documentos
CREATE TABLE public.document_ai_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  documents_analyzed INTEGER DEFAULT 0,
  suggestions_applied INTEGER DEFAULT 0,
  accuracy_score NUMERIC(3,2) DEFAULT 0.0,
  processing_time_avg INTEGER DEFAULT 0, -- en millisegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(org_id, metric_date)
);

-- Habilitar RLS en métricas
ALTER TABLE public.document_ai_metrics ENABLE ROW LEVEL SECURITY;

-- Política RLS para métricas
CREATE POLICY "Users can manage AI metrics from their org" 
ON public.document_ai_metrics FOR ALL 
USING (org_id = get_user_org_id());