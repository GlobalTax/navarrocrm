import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function OutlookCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      // Handle error case
      if (window.opener) {
        window.opener.postMessage({
          type: 'OUTLOOK_AUTH_ERROR',
          error: error
        }, '*')
        window.close()
      } else {
        navigate('/emails/dashboard')
      }
      return
    }

    if (code) {
      // Send code to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'OUTLOOK_AUTH_CODE',
          code: code
        }, '*')
        // Close popup after sending message
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        // If not in popup, redirect to dashboard
        navigate('/emails/dashboard')
      }
    } else {
      // No code or error, redirect to dashboard
      navigate('/emails/dashboard')
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="border-0.5 border-black rounded-[10px] w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Autenticación Completada</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Conectando con Outlook...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}