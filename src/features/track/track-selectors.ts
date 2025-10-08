import type { RootState } from '@/app/store';

/**
 * Track Selectors
 *
 * Purpose: Extract track state from Redux store
 *
 * Selectors:
 * - selectCurrentTrack: Get the currently selected track
 * - selectAudioFeatures: Get audio features for current track
 * - selectTrackLoading: Get track loading state
 * - selectTrackError: Get track error message
 *
 * Usage:
 *   const track = useAppSelector(selectCurrentTrack);
 *   const features = useAppSelector(selectAudioFeatures);
 *   const loading = useAppSelector(selectTrackLoading);
 */

/**
 * Select the currently selected track
 * Returns null if no track is selected
 */
export const selectCurrentTrack = (state: RootState) =>
  state.track.currentTrack;

/**
 * Select the audio features for the current track
 * Returns null if not yet fetched
 */
export const selectAudioFeatures = (state: RootState) =>
  state.track.audioFeatures;

/**
 * Select the track loading state
 * True when fetching track data or audio features from Spotify API
 */
export const selectTrackLoading = (state: RootState) => state.track.loading;

/**
 * Select the track error message
 * Returns null if no error
 */
export const selectTrackError = (state: RootState) => state.track.error;
