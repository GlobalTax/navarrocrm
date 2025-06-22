
import { Timer } from '@/components/timer/Timer'
import { TimeEntriesTable } from '@/components/timer/TimeEntriesTable'
import { DigitalClock } from '@/components/timer/DigitalClock'

export default function TimeTracking() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Tiempo</h1>
          <p className="text-gray-600 mt-2">
            Registra y controla el tiempo dedicado a cada proyecto y cliente
          </p>
        </div>

        {/* Reloj Digital */}
        <div className="mb-6">
          <DigitalClock />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer - Ocupa 1 columna */}
          <div className="lg:col-span-1">
            <Timer />
          </div>
          
          {/* Tabla de entradas - Ocupa 2 columnas */}
          <div className="lg:col-span-2">
            <TimeEntriesTable />
          </div>
        </div>
      </div>
    </div>
  )
}
