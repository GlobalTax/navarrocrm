
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '../utils/contactUtils'

interface CaseForContact {
  id: string
  title: string
  description: string | null
  status: 'open' | 'on_hold' | 'closed'
  practice_area: string | null
  created_at: string
}

interface ContactCasesTabProps {
  relatedCases: CaseForContact[]
  casesLoading: boolean
  onCaseClick: (caseId: string) => void
}

export const ContactCasesTab = ({ relatedCases, casesLoading, onCaseClick }: ContactCasesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Casos Relacionados</CardTitle>
        <CardDescription>
          Expedientes asociados a este contacto
        </CardDescription>
      </CardHeader>
      <CardContent>
        {casesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : relatedCases.length > 0 ? (
          <div className="space-y-3">
            {relatedCases.map((case_) => (
              <div
                key={case_.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onCaseClick(case_.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{case_.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {case_.practice_area} • {formatDate(case_.created_at)}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      case_.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      case_.status === 'closed' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }
                  >
                    {case_.status === 'open' ? 'Abierto' :
                     case_.status === 'closed' ? 'Cerrado' : 'En Espera'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay casos asociados a este contacto</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
