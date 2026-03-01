import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, EyeOff, Clock, User, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useUserCredentials } from '@/hooks/useUserCredentials'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SavedCredentialsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SavedCredentialsDialog = ({ 
  open, 
  onOpenChange 
}: SavedCredentialsDialogProps) => {
  const { credentials, isLoading, viewCredential } = useUserCredentials()
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())

  const togglePasswordVisibility = (credentialId: string) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(credentialId)) {
      newVisible.delete(credentialId)
    } else {
      newVisible.add(credentialId)
      viewCredential(credentialId)
    }
    setVisiblePasswords(newVisible)
  }

  const copyCredentials = (email: string, password: string) => {
    const credentialsText = `Usuario: ${email}\nContraseña: ${password}`
    navigator.clipboard.writeText(credentialsText)
    toast.success('Credenciales copiadas al portapapeles')
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Credenciales Guardadas</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Credenciales de Usuarios Creados
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Credenciales guardadas durante las últimas 24 horas
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {credentials.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay credenciales guardadas
              </p>
              <p className="text-sm text-muted-foreground">
                Las credenciales aparecerán aquí cuando crees usuarios directamente
              </p>
            </div>
          ) : (
            credentials.map((credential) => {
              const isCredentialExpired = isExpired(credential.expires_at)
              const isPasswordVisible = visiblePasswords.has(credential.id)
              
              return (
                <div 
                  key={credential.id} 
                  className={`border rounded-lg p-4 space-y-3 ${
                    isCredentialExpired ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{credential.email}</h3>
                      {isCredentialExpired && (
                        <Badge variant="destructive" className="text-xs">
                          Expirada
                        </Badge>
                      )}
                      {credential.viewed_count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Vista {credential.viewed_count} {credential.viewed_count === 1 ? 'vez' : 'veces'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Creada {formatDistanceToNow(new Date(credential.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={credential.email} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Contraseña temporal</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="text"
                          value="Solo disponible en el momento de creación"
                          readOnly
                          disabled
                          className="font-mono text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expira {formatDistanceToNow(new Date(credential.expires_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                      {credential.last_viewed_at && (
                        <div>
                          Última vista: {formatDistanceToNow(new Date(credential.last_viewed_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`Usuario: ${credential.email}`)
                        toast.success('Email copiado al portapapeles')
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isCredentialExpired}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar email
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}