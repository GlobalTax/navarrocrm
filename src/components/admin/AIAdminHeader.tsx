
import { Button } from '@/components/ui/button'
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
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

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">🤖 Administración de IA</h1>
        <p className="text-muted-foreground">
          Monitoreo y análisis del uso del asistente de IA
        </p>
      </div>
      
      {/* Selector de mes */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
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
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
