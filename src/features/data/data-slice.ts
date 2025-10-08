import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LocalTrackData } from '@/types/data-schema';
import { initialDataState } from './data-types';

/**
 * Data Redux Slice
 *
 * Purpose: Manages local tracks database loading and state
 *
 * Reducers:
 * - setTracks: Set loaded tracks data
 * - setLoaded: Mark data as loaded
 * - setLoading: Update loading state
 * - setError: Set error message
 * - setVersion: Set data version
 *
 * Async Thunks (to be added later):
 * - loadLocalData: Load tracks from JSON file or sessionStorage
 *
 * Usage:
 *   dispatch(loadLocalData())
 *   const tracks = useAppSelector(selectTracks)
 */

const dataSlice = createSlice({
  name: 'data',
  initialState: initialDataState,
  reducers: {
    /**
     * Set the loaded tracks data
     * This is called after successfully loading tracks.json
     */
    setTracks: (state, action: PayloadAction<LocalTrackData[]>) => {
      state.tracks = action.payload;
      state.error = null;
    },

    /**
     * Mark data as successfully loaded
     */
    setLoaded: (state, action: PayloadAction<boolean>) => {
      state.loaded = action.payload;
    },

    /**
     * Update loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * Set error message
     * Used when data loading fails
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    /**
     * Set data version
     * Used for cache invalidation
     */
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
  },
  // extraReducers will be added here when loadLocalData thunk is implemented (T027)
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(loadLocalData.pending, (state) => {
  //       state.loading = true;
  //       state.error = null;
  //     })
  //     .addCase(loadLocalData.fulfilled, (state, action) => {
  //       state.tracks = action.payload.tracks;
  //       state.version = action.payload.version;
  //       state.loaded = true;
  //       state.loading = false;
  //     })
  //     .addCase(loadLocalData.rejected, (state, action) => {
  //       state.error = action.error.message || 'Failed to load tracks';
  //       state.loading = false;
  //     });
  // },
});

export const { setTracks, setLoaded, setLoading, setError, setVersion } =
  dataSlice.actions;

export default dataSlice.reducer;
