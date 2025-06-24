
import type { CompanyData, EInformaTokenResponse, EInformaCompanyResponse } from './types.ts'

export class EInformaService {
  private clientId: string
  private clientSecret: string

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  async getAccessToken(): Promise<string> {
    console.log('🔑 [eInforma] Obteniendo token de acceso...')
    
    const tokenUrl = 'https://developers.einforma.com/api/v1/oauth/token'
    
    const requestBody = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: 'buscar:consultar:empresas'
    })

    console.log('🔍 [eInforma] Enviando request a:', tokenUrl)

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: requestBody
    })

    console.log('📥 [eInforma] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [eInforma] Error obteniendo token:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      if (response.status === 401) {
        throw new Error('INVALID_CREDENTIALS: Las credenciales de eInforma no son válidas')
      } else if (response.status === 400) {
        throw new Error('BAD_REQUEST: Error en los parámetros de autenticación')
      } else {
        throw new Error(`OAUTH_ERROR: ${response.status} - ${errorText}`)
      }
    }

    const tokenData: EInformaTokenResponse = await response.json()
    console.log('✅ [eInforma] Token obtenido exitosamente')
    
    return tokenData.access_token
  }

  async searchCompany(nif: string, accessToken: string): Promise<CompanyData | null> {
    console.log('🔍 [eInforma] Buscando empresa:', nif)
    
    const searchUrl = `https://developers.einforma.com/api/v1/companies/${nif}/report`
    
    console.log('🔍 [eInforma] Enviando request GET a:', searchUrl)

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    })

    console.log('📥 [eInforma] Search response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [eInforma] Error buscando empresa:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      
      if (response.status === 404) {
        return null // Empresa no encontrada
      } else if (response.status === 401) {
        throw new Error('TOKEN_EXPIRED: El token de acceso ha expirado')
      } else if (response.status === 403) {
        throw new Error('ACCESS_DENIED: No tienes permisos para consultar esta empresa')
      } else {
        throw new Error(`SEARCH_ERROR: ${response.status} - ${errorText}`)
      }
    }

    const searchResult: EInformaCompanyResponse = await response.json()
    console.log('📥 [eInforma] Respuesta de eInforma:', {
      denominacion: searchResult.denominacion,
      identificativo: searchResult.identificativo,
      situacion: searchResult.situacion
    })

    if (!searchResult.denominacion) {
      console.log('❌ [eInforma] Sin datos válidos en respuesta')
      return null
    }
    
    // Convertir datos de eInforma a nuestro formato
    const companyData: CompanyData = {
      name: searchResult.denominacion || 'Nombre no disponible',
      nif: searchResult.identificativo || nif,
      address_street: searchResult.domicilioSocial,
      address_city: searchResult.localidad,
      address_postal_code: undefined, // eInforma no separa el código postal
      business_sector: searchResult.cnae,
      legal_representative: searchResult.cargoPrincipal,
      status: (searchResult.situacion === 'Activa' || searchResult.situacion === 'ACTIVA') ? 'activo' : 'inactivo',
      client_type: 'empresa'
    }

    console.log('✅ [eInforma] Datos convertidos exitosamente')
    return companyData
  }

  async lookupCompany(nif: string): Promise<CompanyData | null> {
    try {
      const accessToken = await this.getAccessToken()
      console.log('✅ [eInforma] Token de acceso obtenido exitosamente')

      const companyData = await this.searchCompany(nif, accessToken)
      
      if (!companyData) {
        console.log('❌ [eInforma] Empresa no encontrada')
        return null
      }

      console.log('✅ [eInforma] Empresa encontrada:', companyData.name)
      return companyData

    } catch (error) {
      console.error('❌ [eInforma] Error en búsqueda:', error)
      throw error
    }
  }
}
