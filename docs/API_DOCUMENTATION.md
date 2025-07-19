# Documentación de API

## Edge Functions de Supabase

### 1. sync-quantum-invoices

**Propósito**: Sincronizar facturas desde la API de Quantum Economics

**Endpoint**: `POST /functions/v1/sync-quantum-invoices`

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**:
```json
{
  "org_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "processed": 150,
  "created": 75,
  "updated": 75,
  "message": "Sincronización completada exitosamente"
}
```

**Errores Comunes**:
- `400`: Parámetros inválidos
- `401`: Token no válido
- `500`: Error en API de Quantum

### 2. generate-document-ai

**Propósito**: Generar documentos legales usando IA

**Endpoint**: `POST /functions/v1/generate-document-ai`

**Body**:
```json
{
  "template_id": "uuid",
  "case_id": "uuid",
  "variables": {
    "client_name": "Juan Pérez",
    "case_number": "2024-0001",
    "court_name": "Juzgado de Primera Instancia"
  },
  "document_type": "contract"
}
```

**Respuesta**:
```json
{
  "success": true,
  "document_id": "uuid",
  "content": "Contenido del documento generado...",
  "suggestions": [
    {
      "type": "legal_clause",
      "position": 150,
      "suggestion": "Agregar cláusula de confidencialidad"
    }
  ]
}
```

### 3. outlook-email-sync

**Propósito**: Sincronizar emails con Microsoft Outlook

**Endpoint**: `POST /functions/v1/outlook-email-sync`

**Body**:
```json
{
  "user_id": "uuid",
  "folder_id": "inbox",
  "last_sync": "2024-01-01T00:00:00Z"
}
```

**Respuesta**:
```json
{
  "success": true,
  "emails_processed": 25,
  "new_emails": 10,
  "updated_emails": 5,
  "last_sync": "2024-01-15T10:30:00Z"
}
```

### 4. send-whatsapp

**Propósito**: Enviar mensajes de WhatsApp Business

**Endpoint**: `POST /functions/v1/send-whatsapp`

**Body**:
```json
{
  "to": "+34612345678",
  "message": "Su cita está confirmada para mañana a las 10:00",
  "case_id": "uuid",
  "template_name": "appointment_confirmation"
}
```

### 5. send-ai-alert

**Propósito**: Enviar alertas inteligentes basadas en eventos

**Endpoint**: `POST /functions/v1/send-ai-alert`

**Body**:
```json
{
  "alert_type": "deadline_approaching",
  "case_id": "uuid",
  "severity": "high",
  "message": "El plazo para presentar documentos vence en 3 días"
}
```

## Hooks de React Query

### Gestión de Casos

#### `useCases(filters?)`
```typescript
const { data: cases, isLoading, error } = useCases({
  status: 'open',
  practice_area: 'civil',
  responsible_solicitor_id: 'uuid'
});
```

#### `useCreateCase()`
```typescript
const createCase = useCreateCase();

await createCase.mutateAsync({
  title: "Nuevo caso",
  contact_id: "uuid",
  practice_area: "civil",
  billing_method: "hourly"
});
```

### Gestión de Contactos

#### `useContacts(searchTerm?)`
```typescript
const { data: contacts } = useContacts("Juan");
```

#### `useContactDetails(contactId)`
```typescript
const { data: contact } = useContactDetails("uuid");
```

### Time Tracking

#### `useTimeEntries(filters?)`
```typescript
const { data: entries } = useTimeEntries({
  user_id: "uuid",
  case_id: "uuid",
  start_date: "2024-01-01",
  end_date: "2024-01-31"
});
```

#### `useCreateTimeEntry()`
```typescript
const createEntry = useCreateTimeEntry();

await createEntry.mutateAsync({
  case_id: "uuid",
  description: "Revisión de documentos",
  duration_minutes: 120,
  hourly_rate: 150,
  is_billable: true
});
```

### Quantum Integration

#### `useQuantumInvoices(filters?)`
```typescript
const { data: invoices } = useQuantumInvoices({
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  client_name: "ACME Corp"
});
```

#### `useSyncQuantumInvoices()`
```typescript
const syncInvoices = useSyncQuantumInvoices();

await syncInvoices.mutateAsync({
  org_id: "uuid",
  start_date: "2024-01-01",
  end_date: "2024-12-31"
});
```

### Gestión de Documentos

#### `useDocumentTemplates()`
```typescript
const { data: templates } = useDocumentTemplates();
```

#### `useGenerateDocument()`
```typescript
const generateDoc = useGenerateDocument();

await generateDoc.mutateAsync({
  template_id: "uuid",
  case_id: "uuid",
  variables: {
    client_name: "Juan Pérez",
    date: "2024-01-15"
  }
});
```

## Tipos TypeScript Principales

### Case Management
```typescript
interface Case {
  id: string;
  org_id: string;
  contact_id: string;
  matter_number: string;
  title: string;
  description?: string;
  status: 'open' | 'closed' | 'on_hold';
  practice_area?: string;
  billing_method: 'hourly' | 'fixed' | 'contingency';
  date_opened: string;
  date_closed?: string;
  responsible_solicitor_id?: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  org_id: string;
  case_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
}
```

### Time Tracking
```typescript
interface TimeEntry {
  id: string;
  org_id: string;
  user_id: string;
  case_id: string;
  task_id?: string;
  description: string;
  duration_minutes: number;
  entry_type: 'billable' | 'office_admin' | 'business_development' | 'internal';
  hourly_rate?: number;
  is_billable: boolean;
  created_at: string;
}
```

### Quantum Integration
```typescript
interface QuantumInvoice {
  id: string;
  quantum_invoice_id: string;
  org_id: string;
  contact_id?: string;
  client_name: string;
  series_and_number: string;
  invoice_date: string;
  total_amount_without_taxes: number;
  total_amount: number;
  quantum_data: Record<string, any>;
  created_at: string;
}

interface QuantumInvoiceFilters {
  start_date?: string;
  end_date?: string;
  contact_id?: string;
  client_name?: string;
}
```

### Proposals
```typescript
interface Proposal {
  id: string;
  org_id: string;
  contact_id: string;
  proposal_number: string;
  title: string;
  description?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'won' | 'lost';
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  sent_at?: string;
  accepted_at?: string;
  created_at: string;
}

interface ProposalLineItem {
  id: string;
  proposal_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
```

## Estados de Error Comunes

### Códigos de Error HTTP
- `400`: Bad Request - Parámetros inválidos
- `401`: Unauthorized - Token inválido o expirado
- `403`: Forbidden - Sin permisos para la operación
- `404`: Not Found - Recurso no encontrado
- `409`: Conflict - Conflicto de datos (ej: duplicados)
- `422`: Unprocessable Entity - Validación fallida
- `429`: Too Many Requests - Rate limit excedido
- `500`: Internal Server Error - Error del servidor

### Manejo de Errores en React Query
```typescript
const { data, error, isError } = useQuery({
  queryKey: ['cases'],
  queryFn: fetchCases,
  onError: (error) => {
    if (error.message.includes('RLS')) {
      // Manejar errores de permisos
      toast.error('No tienes permisos para ver estos datos');
    }
  }
});
```

## Rate Limits

- **Edge Functions**: 100 req/min por usuario
- **Database**: 1000 req/min por organización
- **Quantum API**: 50 req/min por organización
- **OpenAI API**: Según plan contratado

## Webhooks

### Configuración de Webhooks
```typescript
// Ejemplo de webhook para sincronización automática
const webhookConfig = {
  url: 'https://your-domain.com/webhooks/quantum',
  events: ['invoice.created', 'invoice.updated'],
  secret: 'your-secret-key'
};
```

### Verificación de Firmas
```typescript
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculated = hmac.digest('hex');
  return calculated === signature;
}
```