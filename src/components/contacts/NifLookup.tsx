
import React from 'react'
import { useNifValidation } from './hooks/useNifValidation'
import { useNifSearch } from './hooks/useNifSearch'
import { NifInputForm } from './components/NifInputForm'
import { CompanySearchResult } from './components/CompanySearchResult'
import type { CompanyData } from '@/hooks/useCompanyLookup'

interface NifLookupProps {
  onCompanyFound: (company: CompanyData) => void
  initialNif?: string
  disabled?: boolean
}

export const NifLookup = ({ onCompanyFound, initialNif = '', disabled = false }: NifLookupProps) => {
  const { nif, formatNif, isValidFormat, getValidationMessage } = useNifValidation(initialNif)
  const { lastSearchResult, searchError, isLoading, performSearch, clearSearchError } = useNifSearch()

  const handleSearch = async () => {
    if (!isValidFormat(nif)) {
      return
    }
    await performSearch(nif, onCompanyFound)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleNifChange = (value: string) => {
    formatNif(value)
    clearSearchError()
  }

  return (
    <div className="space-y-3">
      <NifInputForm
        nif={nif}
        onNifChange={handleNifChange}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
        disabled={disabled}
        isValidFormat={isValidFormat}
        validationMessage={getValidationMessage()}
        searchError={searchError}
      />

      {lastSearchResult && (
        <CompanySearchResult result={lastSearchResult} />
      )}
    </div>
  )
}
