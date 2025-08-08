import { AIAssistant } from '../components/AIAssistant'

export default function AIPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Asistente de Inteligencia Artificial
          </h1>
          <p className="text-gray-600">
            Tu compañero inteligente para tareas legales y administrativas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Funcionalidades</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">📋 Gestión de Documentos</h3>
                  <p className="text-sm text-gray-600">Generación automática de contratos y documentos legales</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">⚖️ Consultas Legales</h3>
                  <p className="text-sm text-gray-600">Respuestas rápidas a preguntas jurídicas comunes</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">📊 Análisis de Casos</h3>
                  <p className="text-sm text-gray-600">Evaluación inteligente de expedientes y riesgos</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">🔍 Investigación</h3>
                  <p className="text-sm text-gray-600">Búsqueda de jurisprudencia y normativa relevante</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Acceso Rápido</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Generar Contrato</div>
                  <div className="text-sm text-gray-500">Crear documento personalizado</div>
                </button>
                <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Consulta Rápida</div>
                  <div className="text-sm text-gray-500">Pregunta al asistente</div>
                </button>
                <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Analizar Caso</div>
                  <div className="text-sm text-gray-500">Evaluar expediente actual</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Widget */}
      {/* Note: AIAssistant should be used as a floating widget, not embedded here */}
    </div>
  )
}