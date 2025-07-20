
// Interfaces para AI Assistant
export interface AIAction {
  type: string
  payload?: unknown
  target?: string
}

// Interfaces para Collaboration Hub
export interface ActiveCase {
  id: string
  title: string
  clientName: string
  clientType: 'empresa' | 'particular'
  status: 'activo' | 'pendiente' | 'cerrado'
  unreadCount: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  avatar: string
}

// Interfaces para Document Generator
export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
  required?: boolean
  defaultValue?: unknown
}

// Interfaces para Proposals
export interface ProposalData {
  id: string
  title: string
  description: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  client_id: string
  created_at: string
  updated_at: string
}

// Interface para Network Status
export interface NetworkInfo {
  isOnline: boolean
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  downlink: number
  rtt: number
}

// Interfaces para validación
export interface ValidationError {
  row: number
  field: string
  message: string
}
