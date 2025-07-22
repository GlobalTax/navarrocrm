import { useState } from 'react'

export const useCollaborationHub = () => {
  const [activeCases] = useState([
    { id: '1', title: 'Caso Mercantil ABC', clientName: 'TechCorp SL', clientType: 'empresa', status: 'activo', unreadCount: 3 },
    { id: '2', title: 'Divorcio Sr. García', clientName: 'Juan García', clientType: 'particular', status: 'pendiente', unreadCount: 0 }
  ])

  const [teamMembers] = useState([
    { id: '1', name: 'Ana Martínez', role: 'Abogada Senior', status: 'online', avatar: '' },
    { id: '2', name: 'Carlos López', role: 'Partner', status: 'busy', avatar: '' }
  ])

  const [messages] = useState([
    { caseId: '1', content: '¿Podemos revisar el contrato?', senderName: 'Cliente', isOwn: false, timestamp: '10:30', senderAvatar: '', attachments: [] },
    { caseId: '1', content: 'Por supuesto, lo revisamos ahora', senderName: 'Ana', isOwn: true, timestamp: '10:32', senderAvatar: '', attachments: [] }
  ])

  const [notifications] = useState([
    { type: 'message', title: 'Nuevo mensaje', description: 'Cliente ha enviado documentos', time: '5 min ago' },
    { type: 'document', title: 'Documento firmado', description: 'Contrato firmado digitalmente', time: '15 min ago' }
  ])

  const sendMessage = (caseId: string, content: string) => {
    console.log(`Sending message to case ${caseId}: ${content}`)
  }

  const scheduleCall = (caseId: string, datetime: string) => {
    console.log(`Scheduling call for case ${caseId} at ${datetime}`)
  }

  const shareDocument = (caseId: string, document: any) => {
    console.log(`Sharing document in case ${caseId}:`, document)
  }

  const inviteCollaborator = (email: string, role: string) => {
    console.log(`Inviting ${email} as ${role}`)
  }

  return {
    activeCases,
    teamMembers,
    messages,
    notifications,
    sendMessage,
    scheduleCall,
    shareDocument,
    inviteCollaborator
  }
}