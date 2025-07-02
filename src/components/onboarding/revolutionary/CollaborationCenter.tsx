import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Users, 
  FileText, 
  Video, 
  Phone,
  Send,
  Plus,
  Clock,
  CheckCircle,
  User,
  Building,
  Calendar,
  Paperclip
} from 'lucide-react'
import { useCollaborationHub } from '@/hooks/useCollaborationHub'

export const CollaborationCenter: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  
  const {
    activeCases,
    teamMembers,
    messages,
    notifications,
    sendMessage,
    scheduleCall,
    shareDocument,
    inviteCollaborator
  } = useCollaborationHub()

  const handleSendMessage = () => {
    if (newMessage.trim() && activeChat) {
      sendMessage(activeChat, newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0.5 border-black rounded-[10px] bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-[10px]">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl">Centro de Colaboración</div>
              <div className="text-sm font-normal text-gray-600">
                Hub centralizado para equipos multi-stakeholder
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white border-0.5 border-black rounded-[10px]"
              >
                <Video className="h-4 w-4 mr-2" />
                Nueva Llamada
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-0.5 border-black rounded-[10px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Invitar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeCases.length}</div>
              <div className="text-xs text-gray-600">Casos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-xs text-gray-600">Colaboradores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{notifications.length}</div>
              <div className="text-xs text-gray-600">Notificaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-xs text-gray-600">Reuniones Hoy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Casos/Chats */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Casos Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {activeCases.map((caseItem) => (
              <div 
                key={caseItem.id}
                className={`p-3 rounded-[10px] cursor-pointer transition-all ${
                  activeChat === caseItem.id ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setActiveChat(caseItem.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                    {caseItem.clientType === 'empresa' ? (
                      <Building className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{caseItem.title}</div>
                    <div className="text-sm text-gray-600 truncate">{caseItem.clientName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className="border-0.5 border-black rounded-[10px] text-xs"
                      >
                        {caseItem.status}
                      </Badge>
                      {caseItem.unreadCount > 0 && (
                        <Badge 
                          className="bg-red-500 text-white rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {caseItem.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Principal */}
        <Card className="border-0.5 border-black rounded-[10px] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {activeChat ? (
                  <span>{activeCases.find(c => c.id === activeChat)?.title || 'Chat'}</span>
                ) : (
                  <span>Selecciona un caso para chatear</span>
                )}
              </div>
              {activeChat && (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-0.5 border-black rounded-[10px]"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-0.5 border-black rounded-[10px]"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-0.5 border-black rounded-[10px]"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[500px]">
            {activeChat ? (
              <>
                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages
                    .filter(m => m.caseId === activeChat)
                    .map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isOwn && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-md ${message.isOwn ? 'order-first' : ''}`}>
                        <div className={`rounded-[10px] p-3 ${
                          message.isOwn 
                            ? 'bg-primary text-white ml-auto' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p>{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center gap-2 text-sm opacity-90"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {attachment}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${
                          message.isOwn ? 'text-right' : 'text-left'
                        }`}>
                          {message.senderName} • {message.timestamp}
                        </div>
                      </div>
                      {message.isOwn && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input de mensaje */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-0.5 border-black rounded-[10px]"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border-0.5 border-black rounded-[10px] resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 text-white border-0.5 border-black rounded-[10px]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona un caso para comenzar la colaboración</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panel de Equipo y Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipo */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Equipo Colaborativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px]"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`rounded-[10px] ${
                      member.status === 'online' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : member.status === 'busy'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    } border-0.5`}
                  >
                    {member.status}
                  </Badge>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-0.5 border-black rounded-[10px]"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notificaciones y Actividad */}
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {notifications.map((notification, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-[10px]"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.type === 'message' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'document' ? 'bg-green-100 text-green-600' :
                  notification.type === 'call' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notification.type === 'message' && <MessageCircle className="h-4 w-4" />}
                  {notification.type === 'document' && <FileText className="h-4 w-4" />}
                  {notification.type === 'call' && <Phone className="h-4 w-4" />}
                  {notification.type === 'task' && <CheckCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}