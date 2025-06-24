
import type { CompanyData } from './types.ts'

export function generateMockCompanyData(nif: string): CompanyData {
  // Generar datos simulados basados en el NIF para testing (fallback)
  const mockCompanies: Record<string, Partial<CompanyData>> = {
    'B67261552': {
      name: 'TECNOLOGÍA AVANZADA S.L.',
      business_sector: 'Servicios informáticos',
      address_street: 'Calle Gran Vía, 123',
      address_city: 'Madrid',
      address_postal_code: '28013',
      legal_representative: 'Juan García López'
    },
    'A08663619': {
      name: 'CONSULTORÍA EMPRESARIAL S.A.',
      business_sector: 'Consultoría de gestión empresarial',
      address_street: 'Avenida Diagonal, 456',
      address_city: 'Barcelona',
      address_postal_code: '08029',
      legal_representative: 'María Rodríguez Fernández'
    }
  }

  const mockData = mockCompanies[nif] || {
    name: `EMPRESA EJEMPLO ${nif.slice(-4)} S.L.`,
    business_sector: 'Actividades empresariales',
    address_street: 'Calle Principal, 1',
    address_city: 'Madrid',
    address_postal_code: '28001',
    legal_representative: 'Representante Legal'
  }

  return {
    name: mockData.name!,
    nif: nif,
    address_street: mockData.address_street,
    address_city: mockData.address_city,
    address_postal_code: mockData.address_postal_code,
    business_sector: mockData.business_sector,
    legal_representative: mockData.legal_representative,
    status: 'activo',
    client_type: 'empresa'
  }
}
