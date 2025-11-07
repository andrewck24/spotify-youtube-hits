import type { RootState } from "@/lib/store";

/**
 * Spotify Selectors
 *
 * Purpose: Extract Spotify authentication state from Redux store
 *
 * Selectors:
 * - selectSpotifyToken: Get current access token
 * - selectTokenValid: Check if token is valid
 * - selectTokenExpiry: Get token expiry timestamp
 * - selectSpotifyLoading: Get loading state
 * - selectSpotifyError: Get error message
 *
 * Usage:
 *   const token = useAppSelector(selectSpotifyToken);
 *   const isValid = useAppSelector(selectTokenValid);
 */

/**
 * Select the current Spotify API access token
 * Returns null if not authenticated
 */
export const selectSpotifyToken = (state: RootState) => state.spotify.token;

/**
 * Select whether the token is valid
 * Returns false if expired or not yet obtained
 */
export const selectTokenValid = (state: RootState) => state.spotify.tokenValid;

/**
 * Select the token expiry timestamp
 * Returns null if no token
 */
export const selectTokenExpiry = (state: RootState) =>
  state.spotify.tokenExpiry;

/**
 * Select the Spotify loading state
 * True when requesting or refreshing token
 */
export const selectSpotifyLoading = (state: RootState) => state.spotify.loading;

/**
 * Select the Spotify error message
 * Returns null if no error
 */
export const selectSpotifyError = (state: RootState) => state.spotify.error;
