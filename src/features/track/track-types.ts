import type { SpotifyAudioFeatures, SpotifyTrack } from "@/types/spotify";

/**
 * Track Feature State
 *
 * Purpose: Manages the current selected track and its Spotify data
 *
 * State Structure:
 * - currentTrack: The full Spotify track object
 * - audioFeatures: Audio features from Spotify API (danceability, energy, etc.)
 * - loading: Loading state for async operations
 * - error: Error message if fetching fails
 */

export interface TrackState {
  /** Currently selected track from local data or Spotify API */
  currentTrack: SpotifyTrack | null;

  /** Audio features for the current track (fetched separately) */
  audioFeatures: SpotifyAudioFeatures | null;

  /** Loading state for fetchTrackDetails and fetchAudioFeatures thunks */
  loading: boolean;

  /** Error message if track or audio features fetch fails */
  error: string | null;
}

/** Initial state for the track slice */
export const initialTrackState: TrackState = {
  currentTrack: null,
  audioFeatures: null,
  loading: false,
  error: null,
};
