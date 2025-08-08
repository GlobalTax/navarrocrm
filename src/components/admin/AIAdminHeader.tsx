
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AIAdminHeaderProps {
  selectedMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export const AIAdminHeader = ({ 
  selectedMonth, 
  onPreviousMonth, 
  onNextMonth 
}: AIAdminHeaderProps) => {
  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  const monthSelector = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onPreviousMonth}
        className="crm-button-text"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-[10px] border-0.5 border-black">
        <CalendarDays className="h-4 w-4" />
        <span className="font-medium min-w-[120px] text-center">
          {format(selectedMonth, 'MMMM yyyy', { locale: es })}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onNextMonth}
        disabled={isCurrentMonth}
        className="crm-button-text"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <StandardPageHeader
      title="🤖 Administración de IA"
      description="Monitoreo y análisis del uso del asistente de IA"
      actions={monthSelector}
    />
  )
}
