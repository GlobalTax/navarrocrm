
import { useState } from 'react'
import { useCompanyLookup, type CompanyData } from '@/hooks/useCompanyLookup'

export const useNifSearch = () => {
  const [lastSearchResult, setLastSearchResult] = useState<CompanyData & { isSimulated?: boolean, warning?: string } | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const { lookupCompany, isLoading } = useCompanyLookup()

  const performSearch = async (nif: string, onCompanyFound: (company: CompanyData) => void) => {
    if (!nif.trim()) {
      setSearchError('Por favor, introduce un NIF/CIF')
      return
    }

    setSearchError(null)
    setLastSearchResult(null)

    console.log('🔍 NifLookup - Iniciando búsqueda:', nif)

    const result = await lookupCompany(nif)
    if (result) {
      console.log('✅ NifLookup - Empresa encontrada:', result)
      setLastSearchResult(result as CompanyData & { isSimulated?: boolean, warning?: string })
      setSearchError(null)
      onCompanyFound(result)
    } else {
      console.log('❌ NifLookup - No se encontró empresa')
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
