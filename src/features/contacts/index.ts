/**
 * Contacts Feature Module
 * 
 * Gestión de contactos, personas y empresas
 */

// Types
export type {
  Contact,
  Person,
  Company,
  ContactFormData,
  ContactSearchParams,
  ContactType,
  ContactStatus,
  RelationshipType,
  ContactPreference,
  PaymentMethod,
  Language,
  EmailPreferences
} from './types'

// Constants
export {
  CONTACT_TYPES,
  CONTACT_STATUS,
  RELATIONSHIP_TYPES,
  CONTACT_PREFERENCES,
  PAYMENT_METHODS,
  LANGUAGES,
  DEFAULT_CONTACT_VALUES,
  DEFAULT_EMAIL_PREFERENCES,
  COMMON_BUSINESS_SECTORS,
  HOW_FOUND_US_OPTIONS,
  MEETING_TIMES,
  CONTACTS_PAGE_SIZE,
  CONTACT_VALIDATION
} from './constants'

// Services
export { contactsService } from './services/ContactsService'

// Hooks
export {
  useContacts,
  usePersons,
  useCompanies,
  useContactsList,
  useContactSearch,
  useContactByEmail,
  useClients
} from './hooks'

// Utils
export {
  validateNifCif,
  formatNifCif,
  getNifValidationMessage,
  validateEmail,
  validatePhone,
  formatPhone,
  parseEmailPreferences,
  getContactDisplayName,
  getContactInfo,
  getStatusColor,
  getRelationshipColor,
  getClientTypeIcon,
  formDataToContact,
  contactToFormData,
  isDuplicate,
  removeDuplicates,
  searchContacts,
  groupContactsBy
} from './utils'

// Type guards
export { isClient, isProspect, isExClient, isPerson, isCompany } from './types'

// Components (legacy compatibility)
export { ContactsList } from './components/ContactsList'
export { ContactFilters } from './components/ContactFilters'