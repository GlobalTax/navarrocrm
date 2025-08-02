/**
 * Documents Feature Constants
 */

import { DocumentType, DocumentStatus } from './types'

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  contract: 'Contrato',
  letter: 'Carta',
  report: 'Informe',
  invoice: 'Factura',
  agreement: 'Acuerdo',
  other: 'Otro'
}

export const DOCUMENT_STATUS: Record<DocumentStatus, string> = {
  draft: 'Borrador',
  review: 'En revisión',
  approved: 'Aprobado',
  signed: 'Firmado',
  archived: 'Archivado'
}

export const SUPPORTED_FORMATS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/html'
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const VARIABLE_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
  SELECT: 'select'
} as const

export const ACTIVITY_TYPES = {
  CREATED: 'created',
  UPDATED: 'updated',
  SIGNED: 'signed',
  SHARED: 'shared',
  VERSION_CREATED: 'version_created',
  STATUS_CHANGED: 'status_changed'
} as const