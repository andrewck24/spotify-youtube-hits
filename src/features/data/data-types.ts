import type { LocalTrackData } from "@/types/data-schema";

/**
 * Data Feature State
 *
 * Purpose: Manages local tracks database loading and caching
 *
 * State Structure:
 * - tracks: Complete array of track data from tracks.json
 * - loaded: Whether data has been successfully loaded
 * - loading: Loading state for async operations
 * - error: Error message if loading fails
 * - version: Data version for cache invalidation
 */

export interface DataState {
  /** All tracks from local database (tracks.json) */
  tracks: LocalTrackData[];

  /** Whether data has been successfully loaded */
  loaded: boolean;

  /** Loading state for loadLocalData thunk */
  loading: boolean;

  /** Error message if data loading fails */
  error: string | null;

  /** Data version for cache validation */
  version: string | null;
}

/** Initial state for the data slice */
export const initialDataState: DataState = {
  tracks: [],
  loaded: false,
  loading: false,
  error: null,
  version: null,
};
