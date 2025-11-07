import type { SpotifyArtist } from "@/types/spotify";

/**
 * Artist Feature State
 *
 * Purpose: Manages the current selected artist and their Spotify data
 *
 * State Structure:
 * - currentArtist: The full Spotify artist object (with images, followers, etc.)
 * - loading: Loading state for async operations
 * - error: Error message if fetching fails
 */

export interface ArtistState {
  /** Currently selected artist from Spotify API */
  currentArtist: SpotifyArtist | null;

  /** Loading state for fetchArtist thunk */
  loading: boolean;

  /** Error message if artist fetch fails */
  error: string | null;
}

/** Initial state for the artist slice */
export const initialArtistState: ArtistState = {
  currentArtist: null,
  loading: false,
  error: null,
};
