/**
 * Tipos para funcionalidades de IA
 */

export type AIProvider = 'openai' | 'anthropic' | 'gemini'
export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro'
export type AITaskType = 'chat' | 'document_generation' | 'analysis' | 'translation' | 'summarization'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface AIChatSession {
  id: string
  messages: AIMessage[]
  context?: string
  model: AIModel
  created_at: string
  updated_at: string
}

export interface AIAction {
  type: string
  payload: Record<string, unknown>
  label: string
  icon?: string
  description?: string
}

export interface AIUsageStats {
  total_requests: number
  total_tokens: number
  cost_eur: number
  requests_by_model: Record<AIModel, number>
  requests_by_type: Record<AITaskType, number>
  average_response_time: number
  error_rate: number
  period_start: string
  period_end: string
}

export interface AIDocumentAnalysis {
  content_type: string
  language: string
  word_count: number
  key_concepts: string[]
  sentiment_score: number
  complexity_score: number
  suggested_improvements: string[]
  extracted_entities: Array<{
    type: string
    value: string
    confidence: number
  }>
}

export interface AIGenerationRequest {
  prompt: string
  context?: string
  model: AIModel
  max_tokens?: number
  temperature?: number
  variables?: Record<string, unknown>
}

export interface AIGenerationResponse {
  content: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: AIModel
  finish_reason: string
  created_at: string
}