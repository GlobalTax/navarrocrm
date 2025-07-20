
import DOMPurify from 'dompurify'

// Configuración básica para contenido de documentos
const DOCUMENT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'div', 'span', 'br', 'strong', 'em', 'b', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'blockquote', 'pre', 'code'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'width', 'height',
    'class', 'id', 'style'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
}

// Configuración para emails (más restrictiva)
const EMAIL_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'div', 'span', 'br', 'strong', 'em', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'width', 'height',
    'style', 'class'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
}

// Configuración muy básica para contenido simple
const BASIC_CONFIG = {
  ALLOWED_TAGS: ['p', 'div', 'span', 'br', 'strong', 'em', 'b', 'i'],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input']
}

export type SanitizeMode = 'document' | 'email' | 'basic'

/**
 * Sanitiza contenido HTML usando DOMPurify
 * @param html - Contenido HTML a sanitizar
 * @param mode - Modo de sanitización ('document', 'email', 'basic')
 * @returns HTML sanitizado y seguro
 */
export const sanitizeHTML = (html: string, mode: SanitizeMode = 'basic'): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  let config
  switch (mode) {
    case 'document':
      config = DOCUMENT_CONFIG
      break
    case 'email':
      config = EMAIL_CONFIG
      break
    case 'basic':
    default:
      config = BASIC_CONFIG
      break
  }

  try {
    // Configurar DOMPurify
    return String(DOMPurify.sanitize(html, {
      ...config,
      // Mantener comentarios seguros
      KEEP_CONTENT: false,
      // Remover elementos vacíos
      REMOVE_EMPTY: true,
      // Usar un sandbox seguro
      FORCE_BODY: true,
      // Transformar URLs relativas
      SANITIZE_DOM: true
    }))
  } catch (error) {
    console.error('Error sanitizing HTML:', error)
    // En caso de error, devolver texto sin HTML
    return html.replace(/<[^>]*>/g, '')
  }
}

/**
 * Sanitiza y valida contenido HTML específicamente para documentos
 * Permite más tags pero mantiene seguridad
 */
export const sanitizeDocumentHTML = (html: string): string => {
  return sanitizeHTML(html, 'document')
}

/**
 * Sanitiza contenido HTML para emails
 * Configuración específica para templates de email
 */
export const sanitizeEmailHTML = (html: string): string => {
  return sanitizeHTML(html, 'email')
}

/**
 * Sanitiza contenido básico - solo tags seguros básicos
 */
export const sanitizeBasicHTML = (html: string): string => {
  return sanitizeHTML(html, 'basic')
}
