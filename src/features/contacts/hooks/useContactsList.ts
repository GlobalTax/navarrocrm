import { useInfiniteContacts } from '@/hooks/useInfiniteContacts'

export const useContactsList = () => {
  // Temporarily use old hook to maintain compatibility
  // TODO: Migrate to new standardized hooks after migration period
  return useInfiniteContacts()
}