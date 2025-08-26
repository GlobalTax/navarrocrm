/**
 * Base query and mutation builders for consistent data access
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createContextLogger } from '@/utils/logging'
import type { QueryOptions, MutationOptions, StandardQueryResult, StandardMutationResult } from './types'

const logger = createContextLogger('BaseQueries')

// Standard query builder
export const createQuery = <T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): StandardQueryResult<T> => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<T>({
    queryKey,
    queryFn: async () => {
      try {
        logger.debug('Executing query', { queryKey })
        const result = await queryFn()
        logger.debug('Query completed successfully', { queryKey })
        return result
      } catch (err) {
        logger.error('Query failed', { queryKey, error: err })
        throw err
      }
    },
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime ?? 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: options.enabled,
  })

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch
  }
}

// Standard mutation builder
export const createMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, Error, TVariables> = {}
): StandardMutationResult<TData, TVariables> => {
  const queryClient = useQueryClient()

  const {
    mutate,
    mutateAsync,
    isPending: isLoading,
    isError,
    error,
    data
  } = useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        logger.debug('Executing mutation', { variables })
        const result = await mutationFn(variables)
        logger.debug('Mutation completed successfully')
        return result
      } catch (err) {
        logger.error('Mutation failed', { error: err })
        throw err
      }
    },
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      options.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options.onSettled?.(data, error, variables)
    }
  })

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error: error as Error | null,
    data
  }
}