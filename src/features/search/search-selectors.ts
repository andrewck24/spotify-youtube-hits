import type { RootState } from '@/app/store';

/**
 * Search Selectors
 *
 * Purpose: Extract search state from Redux store
 *
 * Selectors:
 * - selectSearchQuery: Get current search query
 * - selectSearchResults: Get search results
 * - selectSearchLoading: Get search loading state
 * - selectFuseInstance: Get Fuse.js instance (for direct usage)
 *
 * Usage:
 *   const query = useAppSelector(selectSearchQuery);
 *   const results = useAppSelector(selectSearchResults);
 *   const loading = useAppSelector(selectSearchLoading);
 */

/**
 * Select the current search query string
 */
export const selectSearchQuery = (state: RootState) => state.search.query;

/**
 * Select the search results
 * Returns empty array if no search has been performed
 */
export const selectSearchResults = (state: RootState) => state.search.results;

/**
 * Select the search loading state
 */
export const selectSearchLoading = (state: RootState) => state.search.loading;

/**
 * Select the Fuse.js instance
 * Returns null if not yet initialized
 * This is useful for direct search operations in hooks
 */
export const selectFuseInstance = (state: RootState) =>
  state.search.fuseInstance;
