import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type Fuse from 'fuse.js';
import type { LocalTrackData } from '@/types/data-schema';
import { initialSearchState, type SearchResult } from './search-types';

/**
 * Search Redux Slice
 *
 * Purpose: Manages artist search using Fuse.js fuzzy search
 *
 * Reducers:
 * - initializeSearch: Set up Fuse.js instance with tracks data
 * - performSearch: Execute search query and update results
 * - clearSearch: Clear search query and results
 * - setLoading: Update loading state
 *
 * Note: The fuseInstance is marked as non-serializable in store configuration
 *
 * Usage:
 *   dispatch(initializeSearch(fuseInstance))
 *   dispatch(performSearch('Gorillaz'))
 *   dispatch(clearSearch())
 */

const searchSlice = createSlice({
  name: 'search',
  initialState: initialSearchState,
  reducers: {
    /**
     * Initialize search with Fuse.js instance
     * This should be called after tracks data is loaded
     * The Fuse instance is created in search-service.ts
     */
    initializeSearch: (
      state,
      action: PayloadAction<Fuse<LocalTrackData>>
    ) => {
      state.fuseInstance = action.payload;
    },

    /**
     * Perform search with the given query
     * Updates both query and results
     */
    performSearch: (
      state,
      action: PayloadAction<{ query: string; results: SearchResult[] }>
    ) => {
      state.query = action.payload.query;
      state.results = action.payload.results;
    },

    /**
     * Clear search query and results
     */
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
    },

    /**
     * Update loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { initializeSearch, performSearch, clearSearch, setLoading } =
  searchSlice.actions;

export default searchSlice.reducer;
