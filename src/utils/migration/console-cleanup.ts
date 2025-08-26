/**
 * Utility to help migrate from console.log to proper logging
 * This creates a comprehensive mapping for console statement replacement
 */

import { logger } from '@/utils/logging'

// Migration helper for console statements
export const migrateLogs = {
  // Replace console.log
  log: (message: string, data?: any) => {
    if (data) {
      logger.info(message, data)
    } else {
      logger.info(message)
    }
  },
  
  // Replace console.error  
  error: (message: string, error?: any) => {
    if (error) {
      logger.error(message, error)
    } else {
      logger.error(message)
    }
  },
  
  // Replace console.warn
  warn: (message: string, data?: any) => {
    if (data) {
      logger.warn(message, data)
    } else {
      logger.warn(message)
    }
  },
  
  // Replace console.debug
  debug: (message: string, data?: any) => {
    if (data) {
      logger.debug(message, data)
    } else {
      logger.debug(message)
    }
  }
}

// Development-only console (for debugging during development)
export const devConsole = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  error: process.env.NODE_ENV === 'development' ? console.error : () => {},
  warn: process.env.NODE_ENV === 'development' ? console.warn : () => {},
  debug: process.env.NODE_ENV === 'development' ? console.debug : () => {}
}