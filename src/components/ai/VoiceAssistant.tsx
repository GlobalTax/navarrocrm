
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, VolumeX, Brain } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { aiLogger } from '@/utils/logging'

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { user } = useApp()

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (error) {
      aiLogger.error('Error accessing microphone', { error: error instanceof Error ? error.message : 'Unknown error' })
      toast.error('No se pudo acceder al micrófono')
    }
  }

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    try {
      // Convert to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Remove data:audio/webm;base64, prefix
        }
        reader.readAsDataURL(audioBlob)
      })

      // Transcribe audio
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      })

      if (transcriptionError) throw transcriptionError

      const transcribedText = transcriptionData.text
      setTranscript(transcribedText)

      // Process with AI
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('voice-ai-assistant', {
        body: {
          transcript: transcribedText,
          context: {
            user_id: user?.id,
            org_id: user?.org_id,
            current_page: window.location.pathname
          }
        }
      })

      if (aiError) throw aiError

      setResponse(aiResponse.response)

      // Convert response to speech
      if (aiResponse.response) {
        await speakResponse(aiResponse.response)
      }

      // Execute any actions
      if (aiResponse.action) {
        executeVoiceAction(aiResponse.action)
      }

    } catch (error) {
      aiLogger.error('Error processing audio', { error: error instanceof Error ? error.message : 'Unknown error' })
      toast.error('No se pudo procesar el audio')
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true)
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: 'alloy'
        }
      })

      if (error) throw error

      // Play the audio
      const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audio = new Audio(URL.createObjectURL(audioBlob))
      
      audio.onended = () => setIsSpeaking(false)
      await audio.play()

    } catch (error) {
      aiLogger.error('Error speaking response', { error: error instanceof Error ? error.message : 'Unknown error' })
      setIsSpeaking(false)
    }
  }

  interface VoiceAction {
    type: 'navigate' | 'create_task' | 'create_client' | 'schedule_meeting'
    url?: string
    data?: Record<string, unknown>
  }

  const executeVoiceAction = (action: VoiceAction) => {
    aiLogger.info('Executing voice action', { actionType: action.type })
    
    switch (action.type) {
      case 'navigate':
        if (action.url) {
          window.location.href = action.url
        }
        break
      case 'create_task':
        // Integration with task creation
        break
      case 'create_client':
        // Integration with client creation
        break
      case 'schedule_meeting':
        // Integration with calendar
        break
      default:
        aiLogger.warn('Unknown voice action type', { actionType: action.type })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Asistente de Voz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className="rounded-full h-16 w-16"
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </div>

        <div className="flex justify-center gap-2">
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? "Escuchando..." : "Listo"}
          </Badge>
          {isProcessing && <Badge variant="outline">Procesando...</Badge>}
          {isSpeaking && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              Hablando
            </Badge>
          )}
        </div>

        {transcript && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Transcripción:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-600 mb-1">Respuesta:</p>
            <p className="text-sm">{response}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Di "Hola asistente" para comenzar</p>
          <p>Comandos: crear tarea, buscar cliente, programar cita, abrir expediente</p>
        </div>
      </CardContent>
    </Card>
  )
}
