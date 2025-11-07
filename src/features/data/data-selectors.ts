import type { RootState } from "@/lib/store";

/**
 * Data Selectors
 *
 * Purpose: Extract data state from Redux store
 *
 * Selectors:
 * - selectTracks: Get all tracks from local database
 * - selectDataLoaded: Check if data has been loaded
 * - selectDataLoading: Get data loading state
 * - selectDataError: Get data error message
 * - selectDataVersion: Get current data version
 *
 * Usage:
 *   const tracks = useAppSelector(selectTracks);
 *   const loaded = useAppSelector(selectDataLoaded);
 *   const loading = useAppSelector(selectDataLoading);
 */

/**
 * Select all tracks from local database
 * Returns empty array if not yet loaded
 */
export const selectTracks = (state: RootState) => state.data.tracks;

/**
 * Select whether data has been loaded
 * Returns true after successful load
 */
export const selectDataLoaded = (state: RootState) => state.data.loaded;

/**
 * Select the data loading state
 * True when loading tracks from JSON or sessionStorage
 */
export const selectDataLoading = (state: RootState) => state.data.loading;

/**
 * Select the data error message
 * Returns null if no error
 */
export const selectDataError = (state: RootState) => state.data.error;

/**
 * Select the current data version
 * Used for cache validation
 */
export const selectDataVersion = (state: RootState) => state.data.version;
