
interface AuthLoadingScreenProps {
  message?: string
}

export const AuthLoadingScreen = ({ message = "Cargando aplicación..." }: AuthLoadingScreenProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)
