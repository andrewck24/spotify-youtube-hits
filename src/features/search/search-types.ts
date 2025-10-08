import type Fuse from 'fuse.js';
import type { LocalTrackData } from '@/types/data-schema';

/**
 * Search Feature State
 *
 * Purpose: Manages artist search functionality using Fuse.js
 *
 * State Structure:
 * - query: Current search query string
 * - results: Array of matching tracks (grouped by artist)
 * - fuseInstance: Fuse.js search engine instance (non-serializable)
 * - loading: Loading state for search operations
 */

/**
 * Search result item containing track data and match score
 */
export interface SearchResult {
  /** Matched track data */
  item: LocalTrackData;
  /** Match score from Fuse.js (lower is better, 0 = perfect match) */
  score?: number;
}

export interface SearchState {
  /** Current search query string */
  query: string;

  /** Search results (tracks matching the query) */
  results: SearchResult[];

  /**
   * Fuse.js search engine instance
   * Note: This is non-serializable and must be ignored by Redux DevTools
   * Will be initialized after tracks data is loaded
   */
  fuseInstance: Fuse<LocalTrackData> | null;

  /** Loading state for search operations */
  loading: boolean;
}

/** Initial state for the search slice */
export const initialSearchState: SearchState = {
  query: '',
  results: [],
  fuseInstance: null,
  loading: false,
};
