import { spotifyApi } from "@/services/spotify-api";
import type { SpotifyAudioFeatures, SpotifyTrack } from "@/types/spotify";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { initialTrackState } from "./track-types";

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
 * Async Thunks:
 * - fetchTrackDetails: Fetch full track data from Spotify API
 * - fetchAudioFeatures: Fetch audio features from Spotify API
 *
 * Usage:
 *   dispatch(setCurrentTrack(track))
 *   dispatch(fetchTrackDetails(trackId))
 *   dispatch(fetchAudioFeatures(trackId))
 */

/**
 * T037: Fetch track details from Spotify API
 * 呼叫 spotifyApi.getTrack() 取得完整歌曲資訊（專輯、發行日期等）
 */
export const fetchTrackDetails = createAsyncThunk(
  "track/fetchTrackDetails",
  async (trackId: string, { rejectWithValue }) => {
    try {
      const track = await spotifyApi.getTrack(trackId);
      return track;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch track";
      // eslint-disable-next-line no-console
      console.error("fetchTrackDetails error:", message);
      return rejectWithValue(message);
    }
  },
);

/**
 * T038: Fetch audio features from Spotify API
 * 呼叫 spotifyApi.getAudioFeatures() 取得音樂特徵（energy, danceability 等）
 */
export const fetchAudioFeatures = createAsyncThunk(
  "track/fetchAudioFeatures",
  async (trackId: string, { rejectWithValue }) => {
    try {
      const features = await spotifyApi.getAudioFeatures(trackId);
      return features;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch audio features";
      // eslint-disable-next-line no-console
      console.error("fetchAudioFeatures error:", message);
      return rejectWithValue(message);
    }
  },
);

const trackSlice = createSlice({
  name: "track",
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTrackDetails.fulfilled,
        (state, action: PayloadAction<SpotifyTrack>) => {
          state.currentTrack = action.payload;
          state.loading = false;
          state.error = null;
        },
      )
      .addCase(fetchTrackDetails.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to fetch track";
        state.loading = false;
      })
      .addCase(
        fetchAudioFeatures.fulfilled,
        (state, action: PayloadAction<SpotifyAudioFeatures>) => {
          state.audioFeatures = action.payload;
        },
      )
      .addCase(fetchAudioFeatures.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to fetch audio features";
      });
  },
});

export const {
  setCurrentTrack,
  setAudioFeatures,
  clearCurrentTrack,
  setLoading,
  setError,
} = trackSlice.actions;

export default trackSlice.reducer;
