
// Tipos base compartidos entre formularios de contactos y clientes
export interface BaseFormData {
  name: string
  email: string
  phone: string
  dni_nif: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_country: string
  legal_representative: string
  client_type: 'particular' | 'empresa' | 'autonomo'
  business_sector: string
  how_found_us: string
  contact_preference: 'email' | 'telefono' | 'whatsapp' | 'presencial'
  preferred_language: 'es' | 'ca' | 'en'
  hourly_rate: string
  payment_method: 'transferencia' | 'domiciliacion' | 'efectivo' | 'tarjeta'
  status: 'activo' | 'inactivo' | 'prospecto' | 'bloqueado'
  tags: string[]
  internal_notes: string
  company_id?: string
}

export interface BaseEntity {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  tags: string[] | null
  internal_notes: string | null
  company_id?: string | null
  org_id: string
  created_at: string
  updated_at: string
}

export const createBaseDefaultValues = (): BaseFormData => ({
  name: '',
  email: '',
  phone: '',
  dni_nif: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: 'España',
  legal_representative: '',
  client_type: 'particular',
  business_sector: '',
  how_found_us: '',
  contact_preference: 'email',
  preferred_language: 'es',
  hourly_rate: '',
  payment_method: 'transferencia',
  status: 'prospecto',
  tags: [],
  internal_notes: '',
  company_id: '',
})

export const mapBaseEntityToFormData = <T extends BaseEntity>(entity: T): Partial<BaseFormData> => ({
  name: entity.name,
  email: entity.email || '',
  phone: entity.phone || '',
  dni_nif: entity.dni_nif || '',
  address_street: entity.address_street || '',
  address_city: entity.address_city || '',
  address_postal_code: entity.address_postal_code || '',
  address_country: entity.address_country || 'España',
  legal_representative: entity.legal_representative || '',
  client_type: (entity.client_type as BaseFormData['client_type']) || 'particular',
  business_sector: entity.business_sector || '',
  how_found_us: entity.how_found_us || '',
  contact_preference: (entity.contact_preference as BaseFormData['contact_preference']) || 'email',
  preferred_language: (entity.preferred_language as BaseFormData['preferred_language']) || 'es',
  hourly_rate: entity.hourly_rate?.toString() || '',
  payment_method: (entity.payment_method as BaseFormData['payment_method']) || 'transferencia',
  status: (entity.status as BaseFormData['status']) || 'prospecto',
  tags: entity.tags || [],
  internal_notes: entity.internal_notes || '',
  company_id: entity.company_id || '',
})

export const mapBaseFormDataToEntity = (data: BaseFormData, orgId: string) => ({
  name: data.name,
  email: data.email || null,
  phone: data.phone || null,
  dni_nif: data.dni_nif || null,
  address_street: data.address_street || null,
  address_city: data.address_city || null,
  address_postal_code: data.address_postal_code || null,
  address_country: data.address_country || null,
  legal_representative: data.legal_representative || null,
  client_type: data.client_type,
  business_sector: data.business_sector || null,
  how_found_us: data.how_found_us || null,
  contact_preference: data.contact_preference,
  preferred_language: data.preferred_language,
  hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
  payment_method: data.payment_method,
  status: data.status,
  tags: data.tags || null,
  internal_notes: data.internal_notes || null,
  company_id: data.company_id || null,
  org_id: orgId,
})
