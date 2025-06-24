
import React, { useState } from 'react'
import { Search, Building2, AlertCircle, CheckCircle2, Loader2, TestTube, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCompanyLookup, type CompanyData } from '@/hooks/useCompanyLookup'

interface NifLookupProps {
  onCompanyFound: (company: CompanyData) => void
  initialNif?: string
  disabled?: boolean
}

export const NifLookup = ({ onCompanyFound, initialNif = '', disabled = false }: NifLookupProps) => {
  const [nif, setNif] = useState(initialNif)
  const [lastSearchResult, setLastSearchResult] = useState<CompanyData & { isSimulated?: boolean, warning?: string } | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const { lookupCompany, isLoading } = useCompanyLookup()

  const handleSearch = async () => {
    if (!nif.trim()) {
      setSearchError('Por favor, introduce un NIF/CIF')
      return
    }

    if (!isValidFormat(nif)) {
      setSearchError('El formato del NIF/CIF no es válido')
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const formatNif = (value: string) => {
    // Formato automático del NIF/CIF mientras se escribe
    const cleaned = value.replace(/[\s-]/g, '').toUpperCase()
    if (cleaned.length <= 9) {
      setNif(cleaned)
      // Limpiar errores al escribir
      if (searchError) {
        setSearchError(null)
      }
    }
  }

  const isValidFormat = (nif: string) => {
    const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
    const nifRegex = /^[0-9]{8}[A-Z]$/
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    
    return nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  }

  const getValidationMessage = () => {
    if (!nif) return null
    if (!isValidFormat(nif)) {
      return 'Formato no válido. Ejemplos: B12345678, 12345678Z, X1234567L'
    }
    return null
  }

  const getResultAlertStyle = () => {
    if (!lastSearchResult) return {}
    
    if (lastSearchResult.warning) {
      return { className: 'border-orange-200 bg-orange-50' }
    } else if (lastSearchResult.isSimulated) {
      return { className: 'border-blue-200 bg-blue-50' }
    } else {
      return { className: 'border-green-200 bg-green-50' }
    }
  }

  const getResultIcon = () => {
    if (!lastSearchResult) return CheckCircle2
    
    if (lastSearchResult.warning) {
      return AlertTriangle
    } else if (lastSearchResult.isSimulated) {
      return TestTube
    } else {
      return CheckCircle2
    }
  }

  const getResultIconColor = () => {
    if (!lastSearchResult) return 'text-green-600'
    
    if (lastSearchResult.warning) {
      return 'text-orange-600'
    } else if (lastSearchResult.isSimulated) {
      return 'text-blue-600'
    } else {
      return 'text-green-600'
    }
  }

  const getResultTextColor = () => {
    if (!lastSearchResult) return 'text-green-800'
    
    if (lastSearchResult.warning) {
      return 'text-orange-800'
    } else if (lastSearchResult.isSimulated) {
      return 'text-blue-800'
    } else {
      return 'text-green-800'
    }
  }

  const getStatusMessage = () => {
    if (!lastSearchResult) return 'Datos cargados correctamente'
    
    if (lastSearchResult.warning) {
      return lastSearchResult.warning
    } else if (lastSearchResult.isSimulated) {
      return 'Datos de prueba para desarrollo'
    } else {
      return 'Datos oficiales del Registro Mercantil cargados correctamente'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Introduce NIF/CIF (ej: B12345678, 12345678Z, X1234567L)"
            value={nif}
            onChange={(e) => formatNif(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isLoading}
            className={`font-mono ${
              searchError || (nif && !isValidFormat(nif)) 
                ? 'border-red-300 focus:border-red-500' 
                : ''
            }`}
          />
          {getValidationMessage() && (
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {getValidationMessage()}
            </p>
          )}
          {searchError && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {searchError}
            </p>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={!nif || !isValidFormat(nif) || isLoading || disabled}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isLoading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {lastSearchResult && (
        <Alert {...getResultAlertStyle()}>
          {React.createElement(getResultIcon(), { 
            className: `h-4 w-4 ${getResultIconColor()}` 
          })}
          <AlertDescription className={getResultTextColor()}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${getResultTextColor().replace('800', '900')} flex items-center gap-2`}>
                    {lastSearchResult.name}
                    {lastSearchResult.isSimulated && (
                      <Badge variant="outline" className={`text-xs ${
                        lastSearchResult.warning 
                          ? 'bg-orange-50 border-orange-200 text-orange-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        <TestTube className="h-3 w-3 mr-1" />
                        {lastSearchResult.warning ? 'Datos de prueba' : 'Desarrollo'}
                      </Badge>
                    )}
                    {!lastSearchResult.isSimulated && (
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                        ✓ Oficial
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-3 w-3" />
                    <span className="text-xs font-mono">{lastSearchResult.nif}</span>
                    <Badge 
                      variant={lastSearchResult.status === 'activo' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {lastSearchResult.status === 'activo' ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {lastSearchResult.address_street && (
                <div className={`text-xs ${getResultTextColor().replace('800', '700')}`}>
                  📍 {lastSearchResult.address_street}
                  {lastSearchResult.address_city && `, ${lastSearchResult.address_city}`}
                  {lastSearchResult.address_postal_code && ` ${lastSearchResult.address_postal_code}`}
                </div>
              )}
              
              {lastSearchResult.business_sector && (
                <div className={`text-xs ${getResultTextColor().replace('800', '700')}`}>
                  🏢 {lastSearchResult.business_sector}
                </div>
              )}
              
              <div className={`text-xs ${getResultTextColor().replace('800', '700')} font-medium`}>
                {lastSearchResult.warning ? '⚠️' : lastSearchResult.isSimulated ? 'ℹ️' : '✅'} {getStatusMessage()}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
