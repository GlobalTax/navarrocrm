/**
 * Cleanup utilities for removing unused files and consolidating code
 */

// Files that can be safely removed after migration
export const DEPRECATED_FILES = [
  // Old context files (after migration complete)
  'src/contexts/AppContext.tsx',
  
  // Legacy hook files
  'src/hooks/useProposalsPageState.ts',
  'src/hooks/proposals/useProposalsPageState.ts', 
  'src/hooks/proposals/useProposalsFilters.ts',
  
  // Duplicate/unused components
  'src/components/cache/BackgroundDataManager.tsx', // Empty TODO file
  
  // Old proposal components (after new feature modules stabilize)
  'src/components/proposals/ProposalsPageLogic.tsx',
  
  // Test files that are broken/outdated
  'src/features/proposals/__tests__/useProposalsQueries.test.ts'
]

// Patterns to find and replace across codebase
export const CLEANUP_PATTERNS = {
  // Console statements -> logger
  'console.log': 'logger.info',
  'console.error': 'logger.error', 
  'console.warn': 'logger.warn',
  'console.debug': 'logger.debug',
  
  // useApp migrations
  'import { useApp }': 'import { useAuth }',
  'const { user } = useApp()': 'const { user } = useAuth()',
  
  // Legacy imports
  'from \'@/components/layout/AppMigrationWrapper\'': 'from \'@/contexts/auth\'',
  'from \'@/contexts/AppContext\'': 'from \'@/contexts/auth\'',
}

/**
 * List of TODO/FIXME items found that need addressing
 */
export const CODE_TODOS = [
  {
    file: 'src/components/cache/BackgroundDataManager.tsx',
    line: 7,
    content: 'TODO: Re-implement background data prefetching after core stability is achieved',
    priority: 'low'
  }
  // Add more as found
]

export default {
  DEPRECATED_FILES,
  CLEANUP_PATTERNS, 
  CODE_TODOS
}