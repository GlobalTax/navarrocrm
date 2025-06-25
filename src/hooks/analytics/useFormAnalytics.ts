
import { useCallback, useEffect, useRef } from 'react'
import { useAdvancedAnalytics } from './useAdvancedAnalytics'

interface FormField {
  name: string
  type: string
  value: string
  focused: boolean
  changed: boolean
  errorCount: number
}

interface FormAnalyticsData {
  formId: string
  startTime: number
  fields: Map<string, FormField>
  interactions: number
  abandonedAt?: string
  completedAt?: string
  validationErrors: Array<{ field: string; error: string; timestamp: number }>
}

export const useFormAnalytics = (formId: string) => {
  const analytics = useAdvancedAnalytics()
  const formDataRef = useRef<FormAnalyticsData>({
    formId,
    startTime: Date.now(),
    fields: new Map(),
    interactions: 0,
    validationErrors: []
  })

  // Track form start
  useEffect(() => {
    analytics.trackEvent('form_analytics', 'form_started', {
      formId,
      timestamp: Date.now()
    })

    // Track form abandonment on page unload
    const handleBeforeUnload = () => {
      if (!formDataRef.current.completedAt) {
        trackFormAbandonment()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formId, analytics])

  const trackFieldFocus = useCallback((fieldName: string, fieldType: string = 'text') => {
    const field = formDataRef.current.fields.get(fieldName) || {
      name: fieldName,
      type: fieldType,
      value: '',
      focused: false,
      changed: false,
      errorCount: 0
    }

    field.focused = true
    formDataRef.current.fields.set(fieldName, field)
    formDataRef.current.interactions++

    analytics.trackEvent('form_analytics', 'field_focused', {
      formId,
      fieldName,
      fieldType,
      interactions: formDataRef.current.interactions,
      timestamp: Date.now()
    })
  }, [formId, analytics])

  const trackFieldChange = useCallback((fieldName: string, value: string) => {
    const field = formDataRef.current.fields.get(fieldName)
    if (field) {
      field.value = value
      field.changed = true
      formDataRef.current.fields.set(fieldName, field)
      formDataRef.current.interactions++

      analytics.trackEvent('form_analytics', 'field_changed', {
        formId,
        fieldName,
        valueLength: value.length,
        hasValue: value.length > 0,
        interactions: formDataRef.current.interactions,
        timestamp: Date.now()
      })
    }
  }, [formId, analytics])

  const trackFieldBlur = useCallback((fieldName: string) => {
    const field = formDataRef.current.fields.get(fieldName)
    if (field) {
      field.focused = false
      formDataRef.current.fields.set(fieldName, field)

      const timeSpent = Date.now() - formDataRef.current.startTime

      analytics.trackEvent('form_analytics', 'field_blurred', {
        formId,
        fieldName,
        timeSpent,
        hasValue: field.value.length > 0,
        wasChanged: field.changed,
        timestamp: Date.now()
      })
    }
  }, [formId, analytics])

  const trackValidationError = useCallback((fieldName: string, errorMessage: string) => {
    const field = formDataRef.current.fields.get(fieldName)
    if (field) {
      field.errorCount++
      formDataRef.current.fields.set(fieldName, field)
      
      const errorEntry = {
        field: fieldName,
        error: errorMessage,
        timestamp: Date.now()
      }
      
      formDataRef.current.validationErrors.push(errorEntry)

      analytics.trackEvent('form_analytics', 'validation_error', {
        formId,
        fieldName,
        errorMessage,
        errorCount: field.errorCount,
        totalErrors: formDataRef.current.validationErrors.length,
        timestamp: Date.now()
      })
    }
  }, [formId, analytics])

  const trackFormSubmission = useCallback((success: boolean, submissionData?: any) => {
    const completionTime = Date.now()
    const totalTime = completionTime - formDataRef.current.startTime
    const completedFields = Array.from(formDataRef.current.fields.values())
      .filter(field => field.value.length > 0).length
    const totalFields = formDataRef.current.fields.size

    formDataRef.current.completedAt = new Date().toISOString()

    analytics.trackEvent('form_analytics', 'form_submitted', {
      formId,
      success,
      totalTime,
      completedFields,
      totalFields,
      completionRate: totalFields > 0 ? (completedFields / totalFields) * 100 : 0,
      totalInteractions: formDataRef.current.interactions,
      totalErrors: formDataRef.current.validationErrors.length,
      fieldDetails: Array.from(formDataRef.current.fields.values()).map(field => ({
        name: field.name,
        type: field.type,
        hasValue: field.value.length > 0,
        errorCount: field.errorCount,
        wasChanged: field.changed
      })),
      timestamp: Date.now()
    })

    // Track conversion funnel
    if (success) {
      analytics.trackEvent('conversion', 'form_conversion', {
        formId,
        conversionTime: totalTime,
        completionRate: (completedFields / totalFields) * 100
      })
    }
  }, [formId, analytics])

  const trackFormAbandonment = useCallback(() => {
    const abandonTime = Date.now()
    const timeSpent = abandonTime - formDataRef.current.startTime
    const completedFields = Array.from(formDataRef.current.fields.values())
      .filter(field => field.value.length > 0).length
    const totalFields = formDataRef.current.fields.size
    const lastInteractedField = Array.from(formDataRef.current.fields.values())
      .filter(field => field.focused || field.changed)
      .pop()

    formDataRef.current.abandonedAt = new Date().toISOString()

    analytics.trackEvent('form_analytics', 'form_abandoned', {
      formId,
      timeSpent,
      completedFields,
      totalFields,
      abandonmentRate: totalFields > 0 ? ((totalFields - completedFields) / totalFields) * 100 : 0,
      lastInteractedField: lastInteractedField?.name,
      totalInteractions: formDataRef.current.interactions,
      totalErrors: formDataRef.current.validationErrors.length,
      timestamp: Date.now()
    })
  }, [formId, analytics])

  const getFormAnalytics = useCallback(() => {
    const currentTime = Date.now()
    const totalTime = currentTime - formDataRef.current.startTime
    const fields = Array.from(formDataRef.current.fields.values())
    const completedFields = fields.filter(field => field.value.length > 0).length

    return {
      formId,
      totalTime,
      fields: fields.length,
      completedFields,
      completionRate: fields.length > 0 ? (completedFields / fields.length) * 100 : 0,
      interactions: formDataRef.current.interactions,
      errors: formDataRef.current.validationErrors.length,
      isCompleted: !!formDataRef.current.completedAt,
      isAbandoned: !!formDataRef.current.abandonedAt,
      fieldDetails: fields
    }
  }, [formId])

  // Helper function to automatically track form elements
  const attachFormTracking = useCallback((formElement: HTMLFormElement) => {
    const inputs = formElement.querySelectorAll('input, textarea, select')
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement
      const fieldName = element.name || element.id || `field_${Math.random().toString(36).substr(2, 9)}`
      const fieldType = element.type || element.tagName.toLowerCase()

      // Track initial field registration
      trackFieldFocus(fieldName, fieldType)

      // Add event listeners with proper event handling
      const handleFocus = () => trackFieldFocus(fieldName, fieldType)
      const handleBlur = () => trackFieldBlur(fieldName)
      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement
        trackFieldChange(fieldName, target.value)
      }

      element.addEventListener('focus', handleFocus)
      element.addEventListener('blur', handleBlur)
      element.addEventListener('input', handleInput)
    })

    // Track form submission with proper event handling
    const handleSubmit = (e: SubmitEvent) => {
      const formData = new FormData(formElement)
      const submissionData = Object.fromEntries(formData)
      trackFormSubmission(true, submissionData)
    }

    formElement.addEventListener('submit', handleSubmit)

    return () => {
      // Cleanup event listeners
      inputs.forEach((input) => {
        const element = input as HTMLInputElement
        element.removeEventListener('focus', () => {})
        element.removeEventListener('blur', () => {})
        element.removeEventListener('input', () => {})
      })
      formElement.removeEventListener('submit', handleSubmit)
    }
  }, [trackFieldFocus, trackFieldBlur, trackFieldChange, trackFormSubmission])

  return {
    trackFieldFocus,
    trackFieldChange,
    trackFieldBlur,
    trackValidationError,
    trackFormSubmission,
    trackFormAbandonment,
    getFormAnalytics,
    attachFormTracking
  }
}
