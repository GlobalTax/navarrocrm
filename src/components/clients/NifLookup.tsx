
import { useState } from 'react'
import { Search, Building2, AlertCircle, CheckCircle2 } from 'lucide-react'
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
  const { lookupCompany, isLoading } = useCompanyLookup()

  const handleSearch = async () => {
    const result = await lookupCompany(nif)
    if (result) {
      setLastSearchResult(result)
      onCompanyFound(result)
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
    }
  }

  const isValidFormat = (nif: string) => {
    const cleanNif = nif.replace(/[\s-]/g, '').toUpperCase()
    const nifRegex = /^[0-9]{8}[A-Z]$/
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    
    return nifRegex.test(cleanNif) || cifRegex.test(cleanNif) || nieRegex.test(cleanNif)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Ej: B12345678, 12345678Z, X1234567L"
            value={nif}
            onChange={(e) => formatNif(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isLoading}
            className={`font-mono ${
              nif && !isValidFormat(nif) ? 'border-orange-300 focus:border-orange-500' : ''
            }`}
          />
          {nif && !isValidFormat(nif) && (
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Formato no válido
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
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isLoading ? 'Buscando...' : 'Buscar empresa'}
        </Button>
      </div>

      {lastSearchResult && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>{lastSearchResult.name}</strong>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-3 w-3" />
                  <span className="text-xs">{lastSearchResult.nif}</span>
                  <Badge 
                    variant={lastSearchResult.status === 'activo' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {lastSearchResult.status === 'activo' ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-xs mt-2 text-green-700">
              ✅ Datos cargados desde el Registro Mercantil oficial
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
