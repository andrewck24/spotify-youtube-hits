import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SpotifyArtist } from '@/types/spotify';
import { initialArtistState } from './artist-types';
import { spotifyApi } from '@/services/spotify-api';

/**
 * Artist Redux Slice
 *
 * Purpose: Manages artist selection and Spotify API data
 *
 * Reducers:
 * - setCurrentArtist: Set the selected artist (from local search results)
 * - clearCurrentArtist: Clear artist selection
 * - setLoading: Update loading state
 * - setError: Set error message
 *
 * Async Thunks:
 * - fetchArtist: Fetch full artist data from Spotify API
 *
 * Usage:
 *   dispatch(setCurrentArtist(artist))
 *   dispatch(fetchArtist(artistId))
 */

/**
 * T036: Fetch artist data from Spotify API
 * 呼叫 spotifyApi.getArtist() 取得完整藝人資訊
 */
export const fetchArtist = createAsyncThunk(
  'artist/fetchArtist',
  async (artistId: string, { rejectWithValue }) => {
    try {
      const artist = await spotifyApi.getArtist(artistId);
      return artist;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch artist';
      console.error('fetchArtist error:', message);
      return rejectWithValue(message);
    }
  }
);

const artistSlice = createSlice({
  name: 'artist',
  initialState: initialArtistState,
  reducers: {
    /**
     * Set the currently selected artist
     * This is typically called when user selects an artist from search results
     */
    setCurrentArtist: (state, action: PayloadAction<SpotifyArtist>) => {
      state.currentArtist = action.payload;
      state.error = null;
    },

    /**
     * Clear the current artist selection
     * This resets the artist view
     */
    clearCurrentArtist: (state) => {
      state.currentArtist = null;
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
      .addCase(fetchArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtist.fulfilled, (state, action: PayloadAction<SpotifyArtist>) => {
        state.currentArtist = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchArtist.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch artist';
        state.loading = false;
      });
  },
});

export const { setCurrentArtist, clearCurrentArtist, setLoading, setError } =
  artistSlice.actions;

export default artistSlice.reducer;
