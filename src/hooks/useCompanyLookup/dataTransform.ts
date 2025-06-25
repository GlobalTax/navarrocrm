
import type { CompanyData } from './types'

export const sanitizeCompanyData = (data: any, isSimulated?: boolean, warning?: string): CompanyData => {
  return {
    name: data.name.trim(),
    nif: data.nif.trim().toUpperCase(),
    address_street: data.address_street?.trim() || undefined,
    address_city: data.address_city?.trim() || undefined,
    address_postal_code: data.address_postal_code?.trim() || undefined,
    business_sector: data.business_sector?.trim() || undefined,
    legal_representative: data.legal_representative?.trim() || undefined,
    status: data.status === 'activo' ? 'activo' : 'inactivo',
    client_type: 'empresa',
    isSimulated,
    warning
  }
}
