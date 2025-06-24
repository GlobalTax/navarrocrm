
import { useState } from 'react'
import { Search, Building2, AlertCircle, CheckCircle2, Loader2, TestTube } from 'lucide-react'
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
  const [lastSearchResult, setLastSearchResult] = useState<CompanyData | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSimulated, setIsSimulated] = useState(false)
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
    setIsSimulated(false)

    console.log('🔍 NifLookup - Iniciando búsqueda:', nif)

    const result = await lookupCompany(nif)
    if (result) {
      console.log('✅ NifLookup - Empresa encontrada:', result)
      setLastSearchResult(result)
      setSearchError(null)
      setIsSimulated(true) // Por ahora todos son simulados
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
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-900 flex items-center gap-2">
                    {lastSearchResult.name}
                    {isSimulated && (
                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        <TestTube className="h-3 w-3 mr-1" />
                        Datos de prueba
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
                <div className="text-xs text-green-700">
                  📍 {lastSearchResult.address_street}
                  {lastSearchResult.address_city && `, ${lastSearchResult.address_city}`}
                  {lastSearchResult.address_postal_code && ` ${lastSearchResult.address_postal_code}`}
                </div>
              )}
              
              {lastSearchResult.business_sector && (
                <div className="text-xs text-green-700">
                  🏢 {lastSearchResult.business_sector}
                </div>
              )}
              
              <div className="text-xs text-green-700 font-medium">
                ✅ {isSimulated ? 'Datos de prueba cargados correctamente' : 'Datos oficiales del Registro Mercantil cargados correctamente'}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
