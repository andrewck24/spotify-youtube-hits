import type { RootState } from "@/lib/store";

/**
 * Artist Selectors
 *
 * Purpose: Extract artist state from Redux store
 *
 * Selectors:
 * - selectCurrentArtist: Get the currently selected artist
 * - selectArtistLoading: Get artist loading state
 * - selectArtistError: Get artist error message
 *
 * Usage:
 *   const artist = useAppSelector(selectCurrentArtist);
 *   const loading = useAppSelector(selectArtistLoading);
 */

/**
 * Select the currently selected artist
 * Returns null if no artist is selected
 */
export const selectCurrentArtist = (state: RootState) =>
  state.artist.currentArtist;

/**
 * Select the artist loading state
 * True when fetching artist data from Spotify API
 */
export const selectArtistLoading = (state: RootState) => state.artist.loading;

/**
 * Select the artist error message
 * Returns null if no error
 */
export const selectArtistError = (state: RootState) => state.artist.error;
