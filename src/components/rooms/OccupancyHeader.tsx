
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'

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
  return (
    <div className="bg-white rounded-[10px] border-0.5 border-black shadow-sm p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Título y hora */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Panel de Ocupación
          </h1>
          <div className="text-2xl lg:text-3xl font-mono text-blue-600 mb-1">
            {format(currentTime, 'HH:mm:ss', { locale: es })}
          </div>
          <div className="text-lg text-gray-600">
            {format(currentTime, 'EEEE, d MMMM yyyy', { locale: es })}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-6 lg:gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full mb-3 mx-auto">
              <Users className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-blue-600">{totalRooms}</div>
            <div className="text-sm lg:text-base text-gray-600">Total Salas</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full mb-3 mx-auto">
              <CheckCircle className="h-8 w-8 lg:h-10 lg:w-10 text-green-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-green-600">{availableRooms}</div>
            <div className="text-sm lg:text-base text-gray-600">Disponibles</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-red-100 rounded-full mb-3 mx-auto">
              <AlertCircle className="h-8 w-8 lg:h-10 lg:w-10 text-red-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-red-600">{occupiedRooms}</div>
            <div className="text-sm lg:text-base text-gray-600">Ocupadas</div>
          </div>
        </div>
      </div>
    </div>
  )
}
