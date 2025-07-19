# Esquema de Base de Datos

## Resumen General
- **Total de Tablas**: 87 tablas
- **Funciones**: 42 funciones de PostgreSQL
- **Triggers**: 15 triggers activos
- **Políticas RLS**: 200+ políticas de seguridad

## Estructura Principal

### 1. Gestión de Organizaciones y Usuarios

#### `organizations`
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{}'
);
```

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY, -- FK a auth.users
  org_id UUID REFERENCES organizations(id),
  email VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('partner', 'area_manager', 'senior', 'junior', 'finance')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Gestión de Contactos y Clientes

#### `contacts`
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  client_type VARCHAR CHECK (client_type IN ('particular', 'empresa')),
  company_id UUID REFERENCES contacts(id), -- Auto-referencia para empleados
  quantum_customer_id VARCHAR, -- Integración con Quantum
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Gestión de Casos Legales

#### `cases`
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  matter_number VARCHAR UNIQUE,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'closed', 'on_hold')),
  practice_area VARCHAR,
  billing_method VARCHAR DEFAULT 'hourly',
  date_opened DATE DEFAULT CURRENT_DATE,
  date_closed DATE,
  responsible_solicitor_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `tasks`
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  case_id UUID REFERENCES cases(id),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Control de Tiempo y Facturación

#### `time_entries`
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  case_id UUID REFERENCES cases(id),
  task_id UUID REFERENCES tasks(id),
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  entry_type VARCHAR DEFAULT 'billable' CHECK (entry_type IN ('billable', 'office_admin', 'business_development', 'internal')),
  hourly_rate NUMERIC,
  is_billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. Sistema de Propuestas

#### `proposals`
```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  proposal_number VARCHAR UNIQUE,
  title VARCHAR NOT NULL,
  description TEXT,
  total_amount NUMERIC DEFAULT 0,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'won', 'lost')),
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency VARCHAR CHECK (recurring_frequency IN ('monthly', 'quarterly', 'yearly')),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `proposal_line_items`
```sql
CREATE TABLE proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id),
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED
);
```

### 6. Integración con Quantum Economics

#### `quantum_invoices`
```sql
CREATE TABLE quantum_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  quantum_invoice_id TEXT UNIQUE NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  client_name TEXT NOT NULL,
  series_and_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  total_amount_without_taxes NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  quantum_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. Sistema de Documentos

#### `document_templates`
```sql
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables_schema JSONB DEFAULT '[]',
  template_type VARCHAR DEFAULT 'general',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `documents`
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  case_id UUID REFERENCES cases(id),
  template_id UUID REFERENCES document_templates(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  variables_data JSONB DEFAULT '{}',
  status VARCHAR DEFAULT 'draft',
  version_number INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8. Sistema de Calendar y Eventos

#### `calendar_events`
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  title VARCHAR NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  case_id UUID REFERENCES cases(id),
  contact_id UUID REFERENCES contacts(id),
  outlook_id VARCHAR, -- Para sincronización
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 9. Gestión de Oficina

#### `office_rooms`
```sql
CREATE TABLE office_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  capacity INTEGER,
  equipment JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `room_reservations`
```sql
CREATE TABLE room_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  room_id UUID REFERENCES office_rooms(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  status VARCHAR DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 10. Analytics y Monitoreo

#### `analytics_sessions`
```sql
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  session_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `ai_usage_logs`
```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  function_name VARCHAR DEFAULT 'ai-assistant',
  model_used VARCHAR DEFAULT 'gpt-4o-mini',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost NUMERIC,
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Funciones Importantes

### `get_user_org_id()`
```sql
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT org_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `generate_matter_number(org_uuid UUID)`
```sql
CREATE OR REPLACE FUNCTION generate_matter_number(org_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
  current_year INT;
  matter_count INT;
  matter_number VARCHAR(50);
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  SELECT COUNT(*) INTO matter_count
  FROM cases 
  WHERE org_id = org_uuid 
  AND EXTRACT(YEAR FROM date_opened) = current_year;
  
  matter_number := current_year || '-' || LPAD((matter_count + 1)::TEXT, 4, '0');
  RETURN matter_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Políticas de Seguridad RLS

### Patrón Estándar
```sql
-- Política de visualización
CREATE POLICY "Users can view org data" 
ON table_name FOR SELECT 
USING (org_id = get_user_org_id());

-- Política de inserción
CREATE POLICY "Users can insert org data" 
ON table_name FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

-- Política de actualización
CREATE POLICY "Users can update org data" 
ON table_name FOR UPDATE 
USING (org_id = get_user_org_id());

-- Política de eliminación
CREATE POLICY "Users can delete org data" 
ON table_name FOR DELETE 
USING (org_id = get_user_org_id());
```

### Políticas Especiales por Rol
```sql
-- Solo partners y managers pueden ver todo
CREATE POLICY "Partners can view all" 
ON sensitive_table FOR SELECT 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('partner', 'area_manager')
  )
);
```

## Índices Importantes

```sql
-- Índices de performance para consultas frecuentes
CREATE INDEX idx_cases_org_id ON cases(org_id);
CREATE INDEX idx_cases_contact_id ON cases(contact_id);
CREATE INDEX idx_cases_status_date ON cases(org_id, status, date_opened);

CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, created_at);
CREATE INDEX idx_time_entries_case_billable ON time_entries(case_id, is_billable);

CREATE INDEX idx_quantum_invoices_org_date ON quantum_invoices(org_id, invoice_date);
```

## Triggers Activos

### Auto-actualización de timestamps
```sql
CREATE TRIGGER update_updated_at
BEFORE UPDATE ON table_name
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Auditoría automática
```sql
CREATE TRIGGER log_proposal_changes
AFTER INSERT OR UPDATE OR DELETE ON proposals
FOR EACH ROW
EXECUTE FUNCTION log_proposal_changes();
```