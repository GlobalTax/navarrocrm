export interface OutgoingSubscriptionDocument {
  id: string
  org_id: string
  subscription_id: string
  user_id: string
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  document_type: 'invoice' | 'contract' | 'receipt' | 'other'
  description?: string
  upload_date: string
  created_at: string
  updated_at: string
}

export interface CreateOutgoingSubscriptionDocumentData {
  subscription_id: string
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  document_type: OutgoingSubscriptionDocument['document_type']
  description?: string
}

export const DOCUMENT_TYPES = [
  { value: 'invoice', label: 'Factura' },
  { value: 'contract', label: 'Contrato' },
  { value: 'receipt', label: 'Recibo' },
  { value: 'other', label: 'Otro' }
] as const