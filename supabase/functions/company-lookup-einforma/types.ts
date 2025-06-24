
export interface CompanyData {
  name: string
  nif: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  business_sector?: string
  legal_representative?: string
  status: 'activo' | 'inactivo'
  client_type: 'empresa'
}

export interface EInformaTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface EInformaCompanyResponse {
  denominacion: string
  identificativo: string
  domicilioSocial?: string
  localidad?: string
  cnae?: string
  cargoPrincipal?: string
  situacion?: string
  formaJuridica?: string
  nombreComercial?: string[]
  telefono?: number[]
  web?: string[]
  email?: string
  capitalSocial?: number
  ventas?: number
  empleados?: number
  fechaConstitucion?: string
}
