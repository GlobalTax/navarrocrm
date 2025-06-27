
export const SignupPlaceholder = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
        Crear Cuenta en LegalFlow
      </h2>
      <div className="text-center text-gray-600 mb-4">
        Página de registro en desarrollo
      </div>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Ir al Dashboard (Temporal)
      </button>
    </div>
  </div>
)
