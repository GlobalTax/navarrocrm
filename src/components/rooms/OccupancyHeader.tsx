
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, CheckCircle, AlertCircle } from 'lucide-react'

interface OccupancyHeaderProps {
  currentTime: Date
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
}

export const OccupancyHeader: React.FC<OccupancyHeaderProps> = ({
  currentTime,
  totalRooms,
  occupiedRooms,
  availableRooms
}) => {
  const timeContent = (
    <div className="text-center lg:text-left">
      <div className="text-4xl lg:text-5xl font-mono text-blue-600 mb-2 font-bold">
        {format(currentTime, 'HH:mm:ss', { locale: es })}
      </div>
      <div className="text-xl lg:text-2xl text-gray-600 font-medium">
        {format(currentTime, 'EEEE, d MMMM yyyy', { locale: es })}
      </div>
    </div>
  )

  const statsContent = (
    <div className="grid grid-cols-3 gap-8 lg:gap-12">
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-blue-100 rounded-2xl mb-4 mx-auto shadow-lg">
          <Users className="h-10 w-10 lg:h-12 lg:w-12 text-blue-600" />
        </div>
        <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-1">{totalRooms}</div>
        <div className="text-base lg:text-lg text-gray-600 font-medium">Total Salas</div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-green-100 rounded-2xl mb-4 mx-auto shadow-lg">
          <CheckCircle className="h-10 w-10 lg:h-12 lg:w-12 text-green-600" />
        </div>
        <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-1">{availableRooms}</div>
        <div className="text-base lg:text-lg text-gray-600 font-medium">Disponibles</div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-red-100 rounded-2xl mb-4 mx-auto shadow-lg">
          <AlertCircle className="h-10 w-10 lg:h-12 lg:w-12 text-red-600" />
        </div>
        <div className="text-3xl lg:text-4xl font-bold text-red-600 mb-1">{occupiedRooms}</div>
        <div className="text-base lg:text-lg text-gray-600 font-medium">Ocupadas</div>
      </div>
    </div>
  )

  return (
    <StandardPageHeader
      title="Panel de Ocupación"
      variant="stats"
      customContent={timeContent}
      statsContent={statsContent}
    />
  )
}
