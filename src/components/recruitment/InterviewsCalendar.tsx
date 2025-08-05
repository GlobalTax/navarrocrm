import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/integrations/supabase/client'
import { type Interview } from '@/types/recruitment'

export function InterviewsCalendar() {
  const { user } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews-calendar', user?.org_id, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd')
      
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          candidate:candidates(first_name, last_name, email)
        `)
        .eq('org_id', user?.org_id)
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .order('scheduled_at', { ascending: true })
      
      if (error) throw error
      return data as (Interview & { candidate: any })[]
    },
    enabled: !!user?.org_id
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const getInterviewsForDay = (day: Date) => {
    return interviews.filter(interview => 
      isSameDay(new Date(interview.scheduled_at), day)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <Card className="border-0.5 border-foreground rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario de Entrevistas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="rounded-[10px] border-0.5 border-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="rounded-[10px] border-0.5 border-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayInterviews = getInterviewsForDay(day)
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = isSameDay(day, new Date())
                
                return (
                  <div
                    key={day.toString()}
                    className={`
                      min-h-[80px] p-2 border border-border rounded-[8px] transition-colors
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      hover:bg-muted/50
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      ${isToday ? 'text-primary font-bold' : ''}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayInterviews.slice(0, 2).map((interview) => (
                        <div
                          key={interview.id}
                          className="text-xs p-1 rounded-[4px] bg-primary/10 text-primary border border-primary/20 truncate"
                          title={`${format(new Date(interview.scheduled_at), 'HH:mm')} - ${interview.candidate?.first_name} ${interview.candidate?.last_name}`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(interview.scheduled_at), 'HH:mm')}
                          </div>
                          <div className="truncate">
                            {interview.candidate?.first_name} {interview.candidate?.last_name}
                          </div>
                        </div>
                      ))}
                      
                      {dayInterviews.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayInterviews.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
        
        {/* Leyenda */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/10 border border-primary/20 rounded" />
              <span>Entrevistas programadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 ring-2 ring-primary rounded" />
              <span>Hoy</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}