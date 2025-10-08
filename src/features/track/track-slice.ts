import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SpotifyTrack, SpotifyAudioFeatures } from '@/types/spotify';
import { initialTrackState } from './track-types';

/**
 * Track Redux Slice
 *
 * Purpose: Manages track selection and Spotify API data
 *
 * Reducers:
 * - setCurrentTrack: Set the selected track (from local search results)
 * - setAudioFeatures: Set audio features data
 * - clearCurrentTrack: Clear track selection
 * - setLoading: Update loading state
 * - setError: Set error message
 *
 * Async Thunks (to be added later):
 * - fetchTrackDetails: Fetch full track data from Spotify API
 * - fetchAudioFeatures: Fetch audio features from Spotify API
 *
 * Usage:
 *   dispatch(setCurrentTrack(track))
 *   dispatch(fetchTrackDetails(trackId))
 *   dispatch(fetchAudioFeatures(trackId))
 */

const trackSlice = createSlice({
  name: 'track',
  initialState: initialTrackState,
  reducers: {
    /**
     * Set the currently selected track
     * This is typically called when user selects a track from the track list
     */
    setCurrentTrack: (state, action: PayloadAction<SpotifyTrack>) => {
      state.currentTrack = action.payload;
      state.error = null;
    },

    /**
     * Set audio features for the current track
     * Called after successfully fetching audio features from Spotify API
     */
    setAudioFeatures: (state, action: PayloadAction<SpotifyAudioFeatures>) => {
      state.audioFeatures = action.payload;
    },

    /**
     * Clear the current track selection
     * This resets the track view and clears audio features
     */
    clearCurrentTrack: (state) => {
      state.currentTrack = null;
      state.audioFeatures = null;
      state.error = null;
    },

    /**
     * Update loading state
     * Used by async thunks to indicate fetch progress
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error message
     * Used when Spotify API calls fail
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  // extraReducers will be added here when async thunks are implemented
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchTrackDetails.pending, (state) => {
  //       state.loading = true;
  //       state.error = null;
  //     })
  //     .addCase(fetchTrackDetails.fulfilled, (state, action) => {
  //       state.currentTrack = action.payload;
  //       state.loading = false;
  //     })
  //     .addCase(fetchTrackDetails.rejected, (state, action) => {
  //       state.error = action.error.message || 'Failed to fetch track';
  //       state.loading = false;
  //     })
  //     .addCase(fetchAudioFeatures.fulfilled, (state, action) => {
  //       state.audioFeatures = action.payload;
  //     });
  // },
});

export const {
  setCurrentTrack,
  setAudioFeatures,
  clearCurrentTrack,
  setLoading,
  setError,
} = trackSlice.actions;

export default trackSlice.reducer;
