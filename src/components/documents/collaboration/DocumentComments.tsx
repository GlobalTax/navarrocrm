import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, Send, Check, User, Clock } from 'lucide-react'
import { DocumentComment, useDocumentCollaboration } from '@/hooks/useDocumentCollaboration'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useApp } from '@/contexts/AppContext'

interface DocumentCommentsProps {
  documentId: string
  isInternal?: boolean
}

export const DocumentComments = ({ 
  documentId, 
  isInternal = false 
}: DocumentCommentsProps) => {
  const { user } = useApp()
  const { comments, createComment, resolveComment } = useDocumentCollaboration(documentId)
  const [newComment, setNewComment] = useState('')

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    await createComment.mutateAsync({
      document_id: documentId,
      comment_text: newComment,
      is_internal: isInternal
    })

    setNewComment('')
  }

  const handleResolveComment = (commentId: string) => {
    resolveComment.mutate(commentId)
  }

  const filteredComments = comments.filter(comment => 
    isInternal ? comment.is_internal : !comment.is_internal
  )

  const getCommentStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary-foreground border-primary/20'
      case 'resolved':
        return 'bg-success/10 text-success-foreground border-success/20'
      case 'archived':
        return 'bg-muted/50 text-muted-foreground border-muted'
      default:
        return 'bg-muted/50 text-muted-foreground border-muted'
    }
  }

  const getUserInitials = (userId: string) => {
    // En una implementación real, esto vendría de la info del usuario
    return 'U'
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          {isInternal ? 'Comentarios Internos' : 'Comentarios del Cliente'}
          <Badge variant="secondary" className="ml-auto">
            {filteredComments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área de comentarios */}
        <ScrollArea className="h-64">
          <div className="space-y-4 pr-4">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>
                  {isInternal 
                    ? 'No hay comentarios internos aún'
                    : 'No hay comentarios del cliente aún'
                  }
                </p>
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div 
                  key={comment.id}
                  className="bg-muted/30 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(comment.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Usuario</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCommentStatusColor(comment.status)}`}
                          >
                            {comment.status === 'active' ? 'Activo' : 
                             comment.status === 'resolved' ? 'Resuelto' : 'Archivado'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {comment.status === 'active' && comment.user_id === user?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveComment(comment.id)}
                        disabled={resolveComment.isPending}
                        className="gap-1 text-xs"
                      >
                        <Check className="h-3 w-3" />
                        Resolver
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {comment.comment_text}
                  </p>
                  
                  {comment.position_data && (
                    <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                      📍 Comentario contextual
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Formulario para nuevo comentario */}
        <div className="space-y-3 pt-3 border-t">
          <Textarea
            placeholder={
              isInternal 
                ? "Agregar comentario interno..." 
                : "Agregar comentario para el cliente..."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-20 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleSubmitComment()
              }
            }}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Ctrl + Enter para enviar
            </span>
            
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createComment.isPending}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {createComment.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}