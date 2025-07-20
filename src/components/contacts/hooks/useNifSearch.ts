
import { useState } from 'react'
import { useCompanyLookup, type CompanyData } from '@/hooks/useCompanyLookup'
import { useLogger } from '@/hooks/useLogger'

export const useNifSearch = () => {
  const [lastSearchResult, setLastSearchResult] = useState<CompanyData & { isSimulated?: boolean, warning?: string } | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const { lookupCompany, isLoading } = useCompanyLookup()
  const logger = useLogger('useNifSearch')

  const performSearch = async (nif: string, onCompanyFound: (company: CompanyData) => void) => {
    if (!nif.trim()) {
      setSearchError('Por favor, introduce un NIF/CIF')
      return
    }

    setSearchError(null)
    setLastSearchResult(null)

    logger.info('Iniciando búsqueda', { metadata: { nif } })

    const result = await lookupCompany(nif)
    if (result) {
      logger.info('Empresa encontrada', { metadata: { result } })
      setLastSearchResult(result as CompanyData & { isSimulated?: boolean, warning?: string })
      setSearchError(null)
      onCompanyFound(result)
    } else {
      logger.warn('No se encontró empresa', { metadata: { nif } })
      setSearchError('No se pudo encontrar la empresa')
    }
  }

  const clearSearchError = () => {
    if (searchError) {
      setSearchError(null)
    }
  }

  return {
    lastSearchResult,
    searchError,
    isLoading,
    performSearch,
    clearSearchError
  }
}
