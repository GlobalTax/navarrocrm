
import { Input } from '@/components/ui/input'
import { PremiumButton } from '@/components/ui/premium-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PremiumCard, PremiumCardContent } from '@/components/ui/premium-card'
import { Search, X } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
}

interface PremiumFiltersProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: Array<{
    placeholder: string
    value: string
    onChange: (value: string) => void
    options: FilterOption[]
  }>
  onClearFilters?: () => void
  hasActiveFilters?: boolean
  children?: React.ReactNode
}

export const PremiumFilters = ({
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  filters = [],
  onClearFilters,
  hasActiveFilters = false,
  children
}: PremiumFiltersProps) => {
  return (
    <PremiumCard>
      <PremiumCardContent className="pt-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-premium-muted" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="premium-input pl-10 max-w-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            {filters.map((filter, index) => (
              <Select key={index} value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="premium-input w-48">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-premium-white border-premium-gray">
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            
            {children}
            
            {hasActiveFilters && onClearFilters && (
              <PremiumButton 
                variant="ghost" 
                onClick={onClearFilters} 
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </PremiumButton>
            )}
          </div>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}
